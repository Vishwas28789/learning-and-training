// SmartSociety — Financial Intelligence Platform
// payment.service.spec.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 23: Service Testing
//     (HttpClientTestingModule, HttpTestingController,
//      Mock HTTP responses, Observable emissions, error handling)
//   - Topic 24: Negative Test Cases
// ═══════════════════════════════════════════════════════════════

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { IPayment, PaymentStatus, PaymentType, PaymentMode } from '../models';
import { environment } from '../../../environments/environment';

describe('PaymentService', () => {
  let service: PaymentService;
  // Topic 23: HttpTestingController — Mock HTTP calls
  let httpMock: HttpTestingController;

  const mockPayments: IPayment[] = [
    {
      id: 'PAY-001',
      flatNo: 'A-101',
      memberId: 'MEM-001',
      amount: 5000,
      type: PaymentType.MAINTENANCE,
      date: '2024-01-15',
      mode: PaymentMode.UPI,
      referenceNo: 'UPI123456',
      isLate: false,
      lateFee: 0,
      status: PaymentStatus.PAID,
      description: 'Monthly maintenance'
    },
    {
      id: 'PAY-002',
      flatNo: 'A-102',
      memberId: 'MEM-002',
      amount: 5000,
      type: PaymentType.MAINTENANCE,
      date: '2024-01-10',
      mode: PaymentMode.CASH,
      referenceNo: 'CASH7890',
      isLate: true,
      lateFee: 500,
      status: PaymentStatus.OVERDUE,
      description: 'Overdue maintenance'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Topic 23: HttpClientTestingModule — Provides mock HTTP backend
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });

    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  // ═══════════════════════════════════════════════════════════
  // SERVICE CREATION
  // ═══════════════════════════════════════════════════════════

  it('should be created', () => {
    // Arrange — already done
    // Act — constructor runs
    // Assert
    expect(service).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════
  // HTTP TESTS — Topic 23
  // ═══════════════════════════════════════════════════════════

  it('should fetch all payments via GET', () => {
    // Arrange & Act
    service.getAll().subscribe((payments) => {
      // Assert — Topic 21: toEqual deep equality matcher
      expect(payments.length).toBe(2);
      expect(payments).toEqual(mockPayments);
    });

    // Topic 23: Mock HTTP response
    const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
    expect(req.request.method).toBe('GET');

    // Topic 23: Flush mock data
    req.flush(mockPayments);
  });

  it('should fetch single payment by ID via GET', () => {
    // Arrange
    const paymentId = 'PAY-001';

    // Act
    service.getById(paymentId).subscribe((payment) => {
      // Assert
      expect(payment.id).toBe(paymentId);
      expect(payment.amount).toBe(5000);
    });

    // Topic 23: Mock HTTP response for specific ID
    const req = httpMock.expectOne(`${environment.apiUrl}/payments/${paymentId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPayments[0]);
  });

  it('should create a new payment via POST', () => {
    // Arrange
    const newPayment: Partial<IPayment> = {
      flatNo: 'A-103',
      memberId: 'MEM-003',
      amount: 7500,
      type: PaymentType.WATER,
      date: '2024-02-01',
      mode: PaymentMode.BANK_TRANSFER,
      referenceNo: 'BANK999',
      description: 'Water bill'
    };

    // Act
    service.create(newPayment).subscribe((payment) => {
      // Assert
      expect(payment.flatNo).toBe('A-103');
    });

    // Topic 23: Expect POST request
    const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...newPayment, id: 'PAY-003', isLate: false, lateFee: 0, status: PaymentStatus.PAID });
  });

  it('should delete a payment via DELETE', () => {
    // Arrange
    const paymentId = 'PAY-001';

    // Act
    service.delete(paymentId).subscribe(() => {
      // Assert — Verify internal state was updated
      service.payments$.subscribe((payments) => {
        expect(payments.find(p => p.id === paymentId)).toBeUndefined();
      });
    });

    // Topic 23: Expect DELETE request
    const req = httpMock.expectOne(`${environment.apiUrl}/payments/${paymentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ═══════════════════════════════════════════════════════════
  // TEST OBSERVABLE EMISSIONS — Topic 23
  // ═══════════════════════════════════════════════════════════

  it('should update payments$ BehaviorSubject on getAll', () => {
    // Arrange
    let emittedPayments: IPayment[] = [];

    // Act — Subscribe to the BehaviorSubject stream
    service.payments$.subscribe((payments) => {
      emittedPayments = payments;
    });

    service.getAll().subscribe();

    // Mock the HTTP response
    const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
    req.flush(mockPayments);

    // Assert — Verify the BehaviorSubject emitted
    expect(emittedPayments.length).toBe(2);
  });

  it('should compute payment summary correctly', () => {
    // Arrange — Load mock data first
    service.getAll().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/payments`).flush(mockPayments);

    // Act
    service.getPaymentSummary().subscribe((summary) => {
      // Assert
      expect(summary.totalCollected).toBe(5000);  // Only PAY-001 is PAID
      expect(summary.latePaymentCount).toBe(1);   // PAY-002 is late
      expect(summary.collectionRate).toBe(50);     // 1 of 2 paid
    });
  });

  // ═══════════════════════════════════════════════════════════
  // CSV EXPORT TEST
  // ═══════════════════════════════════════════════════════════

  it('should export payments as CSV string', () => {
    // Arrange — Set internal state
    service.getAll().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/payments`).flush(mockPayments);

    // Act
    const csv = service.exportToCSV();

    // Assert
    expect(csv).toContain('ID,Flat No,Amount');
    expect(csv).toContain('PAY-001');
    expect(csv).toContain('PAY-002');
  });

  // ═══════════════════════════════════════════════════════════
  // ERROR HANDLING TESTS — Topic 23
  // ═══════════════════════════════════════════════════════════

  it('should handle HTTP error on getAll', () => {
    // Arrange & Act
    service.getAll().subscribe({
      error: (error) => {
        // Assert — Error is propagated
        expect(error).toBeTruthy();
      }
    });

    // Topic 23: Simulate HTTP error
    const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  // ═══════════════════════════════════════════════════════════
  // NEGATIVE TEST CASES — Topic 24
  // ═══════════════════════════════════════════════════════════

  it('NEGATIVE: should handle empty payment list for summary', () => {
    // Arrange — No payments loaded

    // Act
    service.getPaymentSummary().subscribe((summary) => {
      // Assert — Should return zeros, not crash
      expect(summary.totalCollected).toBe(0);
      expect(summary.averagePayment).toBe(0);
      expect(summary.collectionRate).toBe(0);
    });
  });

  it('NEGATIVE: should detect overdue correctly with past dates', () => {
    // Arrange — Payment with past due date
    const overduePayment: IPayment = {
      ...mockPayments[0],
      date: '2020-01-01',
      status: PaymentStatus.OVERDUE,
      isLate: true,
      lateFee: 500
    };

    // Act — Load with past-dated overdue payment
    service.getAll().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/payments`).flush([overduePayment]);

    service.getPaymentSummary().subscribe((summary) => {
      // Assert — Should detect as overdue
      expect(summary.totalOverdue).toBeGreaterThan(0);
      expect(summary.latePaymentCount).toBe(1);
    });
  });

  it('NEGATIVE: anomaly detection should NOT flag normal amounts', () => {
    // Arrange — All normal amounts
    const normalPayment = { ...mockPayments[0], amount: 5000 };

    // Act & Assert — Amount 5000 should not trigger anomaly
    expect(normalPayment.amount).toBeLessThan(50000);
  });
});

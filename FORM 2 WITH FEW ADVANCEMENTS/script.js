// Hardcoded users database (using emails)
const usersDatabase = {
    'user@example.com': { password: '123', role: 'USER' },
    'admin@example.com': { password: '123', role: 'ADMIN' }
};

// ASCII Encryption Function
function encryptPassword(password) {
    let encrypted = '';
    for (let i = 0; i < password.length; i++) {
        // Get ASCII value, add 2, convert back to character
        encrypted += String.fromCharCode(password.charCodeAt(i) + 2);
    }
    return encrypted;
}

// ASCII Decryption Function
function decryptPassword(encryptedPassword) {
    let decrypted = '';
    for (let i = 0; i < encryptedPassword.length; i++) {
        // Get ASCII value, subtract 2, convert back to character
        decrypted += String.fromCharCode(encryptedPassword.charCodeAt(i) - 2);
    }
    return decrypted;
}

// Handle Form Submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the values from input fields
    const email = document.getElementById('email').value.trim();
    const enteredPassword = document.getElementById('password').value.trim();

    // Validation: Check if fields are empty
    if (email === '' || enteredPassword === '') {
        showResult('', '', 'Invalid');
        return;
    }

    // Encrypt both email and password
    const encryptedEmail = encryptPassword(email);
    const encryptedPasswordValue = encryptPassword(enteredPassword);

    // Decrypt both for comparison
    const decryptedEmail = decryptPassword(encryptedEmail);
    const decryptedPassword = decryptPassword(encryptedPasswordValue);

    // Check if email exists
    if (!usersDatabase[decryptedEmail]) {
        showResult(encryptedEmail, encryptedPasswordValue, 'Invalid');
        return;
    }

    // Get stored password and compare with decrypted password
    const storedPassword = usersDatabase[decryptedEmail].password;
    
    if (decryptedPassword === storedPassword) {
        // Login successful
        const role = usersDatabase[decryptedEmail].role;
        showResult(encryptedEmail, encryptedPasswordValue, role);
    } else {
        // Invalid password
        showResult(encryptedEmail, encryptedPasswordValue, 'Invalid');
    }
});

// Display Results in the Result Div
function showResult(encryptedEmail, encryptedPass, loginStatus) {
    const resultDiv = document.getElementById('resultDiv');
    const encryptedEmailDiv = document.getElementById('encryptedEmail');
    const encryptedPasswordDiv = document.getElementById('encryptedPassword');
    const roleMessageDiv = document.getElementById('roleMessage');

    // Show result div
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('show');

    // Display encrypted email
    encryptedEmailDiv.innerHTML = `Encrypted Email: <span>${encryptedEmail || 'N/A'}</span>`;

    // Display encrypted password
    encryptedPasswordDiv.innerHTML = `Encrypted Password: <span>${encryptedPass || 'N/A'}</span>`;

    // Display role-based message with color coding
    if (loginStatus === 'USER') {
        roleMessageDiv.innerHTML = `<span class="status-success">USER LOGGED IN</span>`;
    } else if (loginStatus === 'ADMIN') {
        roleMessageDiv.innerHTML = `<span class="status-success">ADMIN DASHBOARD</span>`;
    } else {
        roleMessageDiv.innerHTML = `<span class="status-invalid">Invalid Login</span>`;
    }

    // Optional: Clear form after showing result
    setTimeout(() => {
        document.getElementById('loginForm').reset();
    }, 500);
}


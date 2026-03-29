# learning-and-training

A collection of Angular learning projects and a complete mini project.

---

## 📦 Mini Project — SmartSociety Financial Intelligence Platform

The complete mini project lives in the **`mini project/example3/`** folder.  
It is a production-quality Angular 17 application covering 24 syllabus topics.

### Quick Start (local setup)

```bash
# 1. Clone the repository
git clone https://github.com/Vishwas28789/learning-and-training.git
cd learning-and-training

# 2. Go to the mini project folder
cd "mini project/example3"

# 3. Install dependencies
npm install

# 4. In one terminal — start the mock REST API (port 3000)
npm run api

# 5. In another terminal — start the Angular dev server (port 4200)
npm start
```

Open **http://localhost:4200** in your browser.

### Demo Credentials

| Role   | Email                      | Password   |
|--------|----------------------------|------------|
| Admin  | admin@smartsociety.com     | admin123   |
| Member | member@smartsociety.com    | member123  |

### Run Tests

```bash
cd "mini project/example3"
npm test
```

### Project Highlights

- 🏠 Member management with credit scores and risk assessment  
- 💰 Payment processing — CRUD, CSV export, anomaly detection  
- 📊 SVG bar and line charts  
- 🗳️ Live voting with real-time countdown  
- 🤖 AI Report with typewriter streaming simulation  
- 🔐 JWT simulation, route guards, role-based access  

See [`mini project/example3/README.md`](<mini project/example3/README.md>) for full documentation.

---

## 📁 Repository Structure

```
learning-and-training/
├── mini project/
│   └── example3/          # SmartSociety Angular 17 mini project (main project)
├── angular-basics/        # Angular basics exercises
├── FORM 2 WITH FEW ADVANCEMENTS/  # HTML/CSS/JS form exercises
└── simple form/           # Simple form exercises
```

---

## 🛠 Tech Stack (Mini Project)

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Angular 17 (standalone components)  |
| Language   | TypeScript (strict mode)            |
| Styling    | CSS + Custom Properties             |
| State      | RxJS BehaviorSubject                |
| HTTP       | Angular HttpClient + json-server    |
| Testing    | Jasmine + Karma                     |
| Forms      | Reactive Forms + Template-driven    |
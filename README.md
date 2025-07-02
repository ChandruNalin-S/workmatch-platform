# 💼 WorkMatch - Job Board Platform

WorkMatch is a full-stack job board application that bridges job seekers and employers. It features secure authentication, role-based dashboards, job postings, resume applications, and a responsive UI. Built using Node.js, Express.js, EJS, and PostgreSQL.

---

## 🌟 Features

### 🔐 Authentication & Security
- Register/login/logout using secure local auth
- Passwords hashed with `bcrypt`
- Role-based access control for Employers and Job Seekers

### 🧑‍💼 Employer Dashboard
- Post new job openings
- Edit or delete posted jobs
- View list of applicants for each job
- Download/view applicant resumes

### 🧑‍💻 Job Seeker Dashboard
- Search and view job listings
- Apply for jobs with resume upload
- View application status and history

### 🌐 Frontend
- Fully responsive layout
- EJS templates for server-side rendering
- Clean and modern UI

---

## 🚀 Tech Stack

| Tech         | Description                        |
|--------------|------------------------------------|
| Node.js      | Server runtime                     |
| Express.js   | Web application framework          |
| EJS          | Server-side templating             |
| PostgreSQL   | Relational database                |
| bcrypt       | Password hashing                   |
| Passport.js  | Authentication (Local Strategy)    |
| express-session | Session management             |
| cookie-parser| Cookie handling                    |
| Multer       | Resume file upload handling        |

---

### 🔧 Clone the Repository

```bash
git clone https://github.com/your-username/workmatch-job-board.git
cd workmatch-job-board

🗃 Install Dependencies
-- npm install

▶️ 5. Start the Server
--node index.js or nodemon index.js (nodemon package must be global)

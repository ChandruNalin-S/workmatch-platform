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

📸 Screenshots
### 👨‍💼 Dashboard View
![Screenshot 2025-07-02 132245](https://github.com/user-attachments/assets/0a829353-6c5a-4f74-b82f-1a7786250d7d)

### 🔍 Job Listings & Search
![Screenshot 2025-07-02 132300](https://github.com/user-attachments/assets/d13e0978-211a-4b8c-8871-962e539759fe)

### 📄 Job Description Page
![Screenshot 2025-07-02 132312](https://github.com/user-attachments/assets/5cfa7396-a9f1-49d1-9cc9-bdafaf835f7b)

### 📝 Post a New Job
![Screenshot 2025-07-02 132458](https://github.com/user-attachments/assets/4dd753e7-4168-486b-90ce-4f128601935f)

### 📥 Applicant View for Employers
![Screenshot 2025-07-02 132507](https://github.com/user-attachments/assets/d2258646-6f8d-411b-a187-78f671971e83)

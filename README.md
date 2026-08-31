# 🌟 Eventra - AI-Powered Campus Event Discovery and Management Platform

> **"Discover. Participate. Grow."** — *Never miss an opportunity on campus.*

Eventra is a production-ready, full-stack campus event management platform. It eliminates fragmented campus communications by uniting students, faculty organizers (Teachers), and institutional coordinators (Edu Cell / SAC) on a high-performance system with strict role-based access control, locked institutional profile integrity, AI match recommendations, in-app notifications, smart reminders, and a tamper-evident audit history engine.

---

## 🏛️ Exact User Roles & Permission Matrix

There are **EXACTLY THREE USER ROLES** on Eventra:

| Capability / Feature | STUDENT | TEACHER (Faculty) | EDU CELL / SAC (Coordinator) |
| :--- | :---: | :---: | :---: |
| **Authentication & Registration** | Self-Registration + Login | Login | Login |
| **Official Profile (Name, Roll No, Dept, Sec, Phone, Email)** | **🔒 Strictly Read-Only** | Read-Only | Read-Only |
| **Custom Preferences (Skills, Interests)** | **✏️ Editable Anytime** | N/A | N/A |
| **Event Discovery, Search & Filters** | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **AI Recommendation Match % & Reasons** | ✅ Personalized | N/A | N/A |
| **Direct 1-Click Event Registration** | ✅ **Instant Confirmed** (No approval needed) | ❌ Restricted (403) | ❌ Restricted (403) |
| **Save Events (Bookmarks) & Smart Reminders** | ✅ Active | ❌ Restricted (403) | ❌ Restricted (403) |
| **Event Creation & Publishing** | ❌ Restricted (403) | ✅ **Direct & Instant** (`PUBLISHED`) | 🔒 **Teacher Permission Required** |
| **Event Permission Proposals** | N/A | ✅ Review, Approve & Reject | 📤 Submit Proposals to Faculty |
| **Event Modification & Field-Diff Audit** | ❌ Restricted (403) | ✏️ **Own Events Only** | ✏️ **All Campus Events** |
| **Event Cancellation / Deletion** | ❌ Restricted (403) | 🗑️ **Own Events Only** | 🗑️ **All Campus Events** |
| **Registrations Roster View** | View own registrations | 📋 Registered Students Roster | 📋 Campus-wide Attendance Roster |
| **Tamper-Evident Change History & Timeline** | View current details | 📜 Full History (Own Events) | 📜 Full Campus Audit Trail |

---

## 🔄 Event Hosting & Registration Workflows

### 1. Student Flow
```
Student Login ➡️ Browse Published Events ➡️ 1-Click Register ➡️ Seat Immediately Confirmed 🎉 (No Approvals Needed)
```

### 2. Teacher Flow
```
Teacher Login ➡️ Create Campus Event ➡️ Fill Form ➡️ Submit ➡️ Event Status = PUBLISHED Live Immediately
```

### 3. Edu Cell / SAC Flow
```
SAC Login ➡️ Submit Event Proposal ➡️ Status: PENDING_TEACHER_APPROVAL ➡️ Faculty Reviews & Approves ➡️ SAC 1-Click Publishes ➡️ Event Status = PUBLISHED Live
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18 (TypeScript), Vite 6, Tailwind CSS, Lucide React, React Router v7, Axios, Sonner (Toast notifications), Canvas Confetti.
- **Backend**: Node.js 22, Express 4 (TypeScript / ES Modules), `mysql2/promise` connection pooling, JWT (`jsonwebtoken`), Bcryptjs password hashing, Zod schema validation, Helmet security headers, Morgan logging.
- **Database**: MySQL 8.0 with relational foreign keys, cascades, unique indexes, and audit diff tables.
- **Architecture**: Service-Repository pattern, pluggable `RecommendationEngine`, centralized RBAC middleware, and immutable official record enforcement.

---

## 🔑 Pre-Configured Demo Accounts

All demo accounts use the standard password: `Password@123`

| Role | Name | Email | Details |
| :--- | :--- | :--- | :--- |
| **STUDENT** | Aarav Sharma | `aarav.sharma@campus.edu` | Roll: `21CS001`, Dept: CSE, AI/ML focus |
| **STUDENT** | Priya Patel | `priya.patel@campus.edu` | Roll: `21IT045`, Dept: IT, Web & Cloud |
| **STUDENT** | Rohit Verma | `rohit.verma@campus.edu` | Roll: `22EC012`, Dept: ECE, Robotics & IoT |
| **STUDENT** | Ananya Singh | `ananya.singh@campus.edu` | Roll: `22ME034`, Dept: Mechanical, EV/CAD |
| **STUDENT** | Vikram Reddy | `vikram.reddy@campus.edu` | Roll: `23MB008`, Dept: MBA, Startups/VC |
| **TEACHER** | Prof. Ravi Kumar | `prof.ravi.kumar@campus.edu` | CSE Coordinator & Hackathon Organizer |
| **TEACHER** | Prof. Sunita Sharma | `prof.sunita.sharma@campus.edu` | ECE & Robotics Club Faculty Advisor |
| **TEACHER** | Prof. Arun Deshmukh | `prof.arun.deshmukh@campus.edu` | Head Training & Placement Officer (TPO) |
| **EDU CELL** | SAC Coordinator | `sac.coordinator@campus.edu` | Student Activity Center Head Convener |
| **EDU CELL** | Edu Cell Convener | `educell.lead@campus.edu` | Educational Cell Global Lead |

---

## 💻 Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MySQL Server**: v8.0 or higher
- **npm** / **yarn** / **pnpm**

### Step-by-Step Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/eventra.git
   cd eventra
   ```

2. **Setup Server**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   ```
   *(Update `server/.env` with your MySQL `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`).*

3. **Initialize Database & Seed Realistic Data**:
   ```bash
   npm run db:init
   npm run db:seed
   ```

4. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   *Backend running on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

5. **Setup & Start Frontend Client**:
   In a separate terminal:
   ```bash
   cd client
   npm install
   cp .env.example .env
   npm run dev
   ```
   *Frontend running on `http://localhost:5173`.*

---

## 🧪 Automated Testing

Run the automated integration and permission test suite:
```bash
cd server
npm test
```

---

## 🐳 Docker Deployment (1-Command)

```bash
docker-compose up --build -d
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **MySQL Database**: `localhost:3306`

---

## 🚀 Production Cloud Deployment (Vercel + Render + Railway/Aiven)

### 1. Database (Railway / Aiven / PlanetScale MySQL)
- Provision a MySQL 8.0 instance.
- Run `npm run db:init && npm run db:seed` against your cloud database URL.

### 2. Backend (Render / Railway)
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`
  - `JWT_SECRET=your_production_secret`
  - `FRONTEND_URL=https://your-frontend-domain.vercel.app`

### 3. Frontend (Vercel / Netlify)
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL=https://your-render-backend.onrender.com/api`

---

## 🔒 Security & Quality Highlights

- **Zero Hard-Coded Credentials**: Database connections, JWT secrets, and API endpoints are 100% environment-variable driven.
- **Zero Plaintext Passwords**: Industry-standard bcrypt hashing with 10 salt rounds.
- **Strict Role-Based Access Control (RBAC)**: Backend rejects unauthorized actions with 403 Forbidden.
- **Immutable Institutional Student Records**: Official attributes are locked against student tampering.
- **Granular Audit Logging & Diff History**: Every event alteration tracks exact previous and updated values.

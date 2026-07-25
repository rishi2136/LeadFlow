# LeadFlow — Enterprise Lead Generation & CRM Handling Platform

LeadFlow is a high-performance Lead Generation and Management CRM application built on a full-stack Node.js, Express, and React architecture. It enables businesses to capture lead intake effortlessly, validate client submissions with Formik and Yup, manage lead pipelines in real-time, assign team members, and monitor server diagnostics.

---

## 🌟 Key Features

### 1. Client Intake Landing Page
- **Formik & Yup Schema Validation**: Seamless intake form with live error feedback, work email validation, and required field checks.
- **Budget Tier Categorization**: Dynamic tiering ($5k–$10k Growth Tier, $10k–$50k Pro Tier, $50k+ Enterprise Tier).
- **Responsive Hero & Product Showcase**: High-contrast, elegant presentation highlighting core CRM capabilities.

### 2. Admin CRM Dashboard
- **Live Lead Matrix**: Searchable, filterable lead grid with real-time state modification (New, Contacted, Closed).
- **Team Agent Assignment**: Assign incoming leads directly to registered admin users.
- **Real-Time Polling & Live Sync**: Optional 4-second automatic sync toggle to reflect database updates across sessions.
- **Pipeline Metrics & CSV Export**: One-click CSV report generation and aggregate pipeline value calculation.
- **Custom Activity Logging**: Append custom timeline notes to lead profiles.

### 3. Express Session Auth Engine
- **Session-Based Authentication**: Secure cookie sessions managed via `express-session`.
- **Hybrid Storage Engine**: Automatic fallback to `MemoryStore` when MongoDB is offline, or `MongoStore` via `connect-mongo` when connected.
- **User Roles & Credentials**: Support for default admin access (`admin@leadflow.io`) and user registration.

### 4. Health Diagnostics & Error Boundaries
- **System Error Boundary**: React `ErrorBoundary` wrapper capturing client crashes with detailed status reports.
- **Backend Health Diagnostic**: `/api/health` endpoint pinging server state, session status, and MongoDB connectivity.
- **Simulated 404 / Network Test**: Built-in test trigger to inspect error views and recovery workflows.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Motion, Lucide React, Formik, Yup
- **Backend**: Node.js, Express, Express Session (`express-session`), Mongoose (`mongoose`), Connect Mongo (`connect-mongo`), CORS
- **Tooling**: Esbuild, TSX, Vite Build System

---

## 📁 Project Directory Structure

```
├── .env.example            # Environment variable template
├── index.html              # Vite entry HTML
├── metadata.json           # Application metadata & configuration
├── package.json            # Project dependencies & scripts
├── server.js               # Express server entry point
├── server/
│   ├── app.js              # Express app setup, API routes & Vite middleware
│   ├── db/                 # Mongoose / MongoDB connection module
│   ├── middleware/         # Session & CORS configuration
│   ├── models/             # Mongoose schemas (User, Lead)
│   └── routes/             # Express API routes (auth, leads)
├── src/
│   ├── App.jsx             # Main React application router & state manager
│   ├── main.jsx            # React root mount point
│   ├── index.css           # Tailwind CSS directives
│   ├── components/         # Reusable UI components (Header, Footer, AuthFormik, LeadFormik, ErrorBoundary)
│   ├── services/           # Frontend API client module (api.js)
│   └── views/              # View pages (HomeView, DashboardView, LoginView, RegisterView, ErrorView, NotFoundView)
└── vite.config.js          # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **bun**

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file based on `.env.example`:
```env
MONGODB_URI="mongodb://localhost:27017/leadflow"
SESSION_SECRET="leadflow-secure-session-secret-2026"
```

### 3. Running in Development Mode
Start the Node.js Express server with Vite middleware:
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

### 4. Building for Production
Compile static assets with Vite and start the production Express server:
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description |
| text | text | text |
| `GET` | `/api/auth/me` | Fetch active session user info |
| `POST` | `/api/auth/login` | Authenticate user with email and password |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/logout` | Terminate session |
| `GET` | `/api/auth/users` | List all registered users (for lead assignment) |

### Leads Pipeline Routes (`/api/leads`)
| Method | Endpoint | Description |
| text | text | text |
| `GET` | `/api/leads` | List leads (supports `search`, `status`, `budget`, `sortBy` queries) |
| `POST` | `/api/leads` | Submit a new lead intake |
| `GET` | `/api/leads/stats` | Fetch aggregate metrics (total value, new leads today, conversion rate) |
| `PUT` | `/api/leads/:id/status` | Update lead status (`new`, `contacted`, `closed`) and append notes |
| `PATCH` | `/api/leads/:id` | Update lead fields (e.g. `assignedTo`) |
| `DELETE` | `/api/leads/:id` | Delete a lead from the database |

### System Diagnostics
| Method | Endpoint | Description |
| text | text | text |
| `GET` | `/api/health` | Inspect Express session store and MongoDB connection status |

---

## 🔒 Security & Best Practices

- **HTTP-Only Session Cookies**: Prevents client-side script access to session tokens.
- **Sanitized Inputs**: Validation schemas prevent corrupted or malformed submissions.
- **Graceful Fallback**: App remains operational in memory mode even if external MongoDB connection is uninitialized.

---

## 📄 License

Distributed under the MIT License.

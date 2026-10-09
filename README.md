# DriveGo – Vehicle Rental and Booking Management System

DriveGo is a full-stack peer-to-peer vehicle rental and fleet booking management system built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Designed as an MCA (Master of Computer Applications) academic and portfolio project, the platform demonstrates realistic software engineering practices, role-based authorization, server-side rental pricing, real-time availability checking, booking conflict prevention, mock payment simulation, and verified customer reviews.

---

## 1. Overview & Key Objectives

DriveGo solves double-booking risks and opaque pricing in modern mobility platforms by providing:
- **Strict Double-Booking Conflict Prevention**: Mathematical interval checking (`startA < endB && endA > startB`) enforcing vehicle availability across pending, confirmed, and active rental schedules.
- **Authoritative Server-Side Pricing Engine**: Automatic calculation of hourly, daily, weekly, and monthly rates, including refundable security deposits.
- **Three Distinct User Personas**: Dedicated dashboards and permissions for **Customers**, **Vehicle Owners / Hosts**, and **Platform Administrators**.
- **Lifecycle Management**: From vehicle search and mock payment to owner confirmation, rental activation, return check-in, and verified 1–5 star reviews.

---

## 2. Technology Stack

### Frontend
- **React 19 & Vite**: Ultra-fast build tool and modular functional React architecture.
- **Tailwind CSS v4**: Responsive utility styling adhering to universal design constitution and anti-slop guidelines.
- **React Router DOM v7**: Declarative routing with protected role-based guards.
- **Axios**: HTTP client with request token interceptors and centralized error formatting.
- **Lucide React**: Clean, accessible vector icons.
- **Canvas Confetti**: Engaging visual celebration for completed mock payments and verified reviews.

### Backend
- **Node.js & Express.js**: RESTful service architecture with clean separation of concerns.
- **MongoDB & Mongoose**: Relational referencing, schemas, population, and dual persistent fallback datastore.
- **JWT (JSON Web Tokens)**: Stateless authentication with expiration and payload verification.
- **bcryptjs**: Password hashing with salt rounds.
- **CORS & Environment Management**: Cross-origin security and 12-factor configuration.

---

## 3. Project Architecture

```
drivego/
├── server/
│   ├── config/             # Database connection & persistence engine
│   ├── controllers/        # Business logic (auth, vehicles, bookings, payments, reviews, admin)
│   ├── middleware/         # requireAuth, requireRole, errorHandler
│   ├── models/             # User, Vehicle, Booking, Payment, Review schemas & models
│   ├── routes/             # RESTful API route definitions
│   ├── seed/               # Realistic seed database generator
│   ├── utils/              # priceCalculator, conflictChecker, token
│   └── app.js              # Express app setup & middleware pipeline
├── src/
│   ├── api/                # Axios client with bearer token interceptor
│   ├── assets/             # Curated automotive photography & generated assets
│   ├── components/         # Navbar, Footer, StatusBadge, VehicleCard, BookingWidget, ReviewModal
│   ├── context/            # AuthContext (with 1-click test role switcher), ToastContext
│   ├── pages/
│   │   ├── public/         # HomePage, VehiclesPage, VehicleDetailPage, LoginPage, RegisterPage, About, Contact
│   │   ├── customer/       # CustomerDashboard, PaymentSimulationPage
│   │   ├── owner/          # OwnerDashboard, AddVehiclePage, EditVehiclePage
│   │   └── admin/          # AdminDashboard (Moderation, Users, Vehicles, Bookings)
│   ├── routes/             # ProtectedRoute with RBAC guards
│   ├── App.jsx             # Top-level routing layout
│   └── main.tsx            # React application entry point
├── server.js               # Dev & production Express server with Vite middleware
├── metadata.json           # AI Studio applet metadata
├── package.json
└── README.md
```

---

## 4. User Roles and Permissions

| Feature / Action | Customer | Vehicle Owner | Administrator |
|---|:---:|:---:|:---:|
| Browse & Search Approved Fleet | ✅ | ✅ | ✅ |
| Check Real-Time Availability | ✅ | ✅ | ✅ |
| Reserve Vehicles & Mock Pay | ✅ | ❌ (Cannot self-book) | ❌ |
| Cancel Eligible Bookings | ✅ | ❌ | ✅ (Problematic bookings) |
| Submit Verified 1-5 Star Reviews | ✅ (After completion) | ❌ | ❌ |
| List New Vehicles for Rent | ❌ | ✅ (Submitted for review) | ✅ |
| Accept / Reject Booking Requests | ❌ | ✅ (Owned fleet) | ✅ |
| Mark Vehicle Returned / Completed | ❌ | ✅ | ✅ |
| Approve / Reject Vehicle Listings | ❌ | ❌ | ✅ |
| Suspend / Unblock Users | ❌ | ❌ | ✅ |

---

## 5. Test Accounts (For Project Evaluation)

For fast demonstration, the top navigation includes a **1-Click "Demo" Switcher** (`Customer`, `Owner`, `Admin`) as well as quick-fill buttons on the login screen.

| Role | Email | Password | Description |
|---|---|---|---|
| **Customer** | `customer1@drivego.com` | `password123` | Aarav Mehta (Pune, Active & Past Bookings) |
| **Owner** | `owner1@drivego.com` | `password123` | Vikram Sharma (Mumbai, Fleet Host) |
| **Admin** | `admin@drivego.com` | `admin123` | System Administrator (Full Moderation) |

*Additional seeded customer accounts:* `customer2@drivego.com`, `customer3@drivego.com`, `customer4@drivego.com`, `customer5@drivego.com` (password: `password123`).

---

## 6. Business Logic Details

### A. Double-Booking Prevention Algorithm
```javascript
// Interval overlap condition:
const conflict = existStart < requestedEnd && existEnd > requestedStart;
```
Bookings in `pending`, `confirmed`, or `active` states block availability. Rejected and cancelled bookings immediately release the vehicle schedule.

### B. Server-Side Rental Pricing
- **Hourly**: `Math.max(1, Math.ceil(totalHours)) * hourlyRate`
- **Daily**: `Math.max(1, Math.ceil(totalHours / 24)) * dailyRate`
- **Weekly**: `Math.max(1, Math.ceil(totalDays / 7)) * weeklyRate`
- **Monthly**: `Math.max(1, Math.ceil(totalDays / 30)) * monthlyRate`
- **Total**: `Base Amount + Security Deposit - Discount`

---

## 7. Installation & Local Development

### Prerequisites
- Node.js (v18 or higher)
- Optional: MongoDB connection string (falls back gracefully to embedded persistent JSON store if omitted)

### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/your-username/drivego.git
cd drivego

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start full-stack development server (Express API on port 3000 + Vite)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 8. REST API Reference Overview

### Authentication
- `POST /api/auth/register` – Register new Customer or Owner
- `POST /api/auth/login` – Login & receive JWT
- `GET /api/auth/me` – Current authenticated user session

### Vehicles
- `GET /api/vehicles` – Query vehicles with pagination, search, categories, and price filters
- `GET /api/vehicles/:id` – Detailed vehicle information with host details
- `GET /api/vehicles/:id/availability` – Interval conflict availability check
- `POST /api/vehicles` – Create listing (Owner/Admin)
- `PUT /api/vehicles/:id` – Update listing (Owner/Admin)
- `DELETE /api/vehicles/:id` – Delete listing (Owner/Admin)
- `PATCH /api/vehicles/:id/status` – Update availability (available, maintenance, unavailable)

### Bookings
- `POST /api/bookings` – Create booking request (Customer)
- `GET /api/bookings` – Fetch role-filtered bookings
- `PATCH /api/bookings/:id/cancel` – Cancel booking (Customer/Admin)
- `PATCH /api/bookings/:id/approve` – Accept booking (Owner)
- `PATCH /api/bookings/:id/reject` – Decline booking (Owner)
- `PATCH /api/bookings/:id/complete` – Mark rental completed (Owner/Admin)

### Mock Payments & Reviews
- `POST /api/payments/mock` – Simulate Card, UPI, or Cash payment with transaction ID
- `POST /api/reviews` – Submit 1–5 star rating for completed rental
- `GET /api/reviews/vehicle/:vehicleId` – Verified reviews for a vehicle

### Administrator
- `GET /api/admin/stats` – Platform summary GMV and counts
- `GET /api/admin/users` – List and filter all users
- `PATCH /api/admin/users/:id/block` – Suspend user account
- `PATCH /api/admin/users/:id/unblock` – Restore user account
- `PATCH /api/admin/vehicles/:id/approve` – Publish vehicle to search
- `PATCH /api/admin/vehicles/:id/reject` – Reject vehicle listing

---

## 9. Academic Project Submission Details

- **Project Title:** DriveGo – Vehicle Rental and Booking Management System
- **Program:** Master of Computer Applications (MCA)
- **Architecture:** Full-Stack MERN (MongoDB, Express, React, Node.js)
- **Key Modules:** Authentication, Fleet Inventory, Booking Engine, Pricing Algorithms, Mock Payments, Administrative Moderation, Responsive UI/UX.

---

## 10. License
Academic Portfolio Project – Released under the Apache 2.0 License.

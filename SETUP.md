# Reimbursement System Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

## Installation

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Environment Setup
Update `server/.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reimbursement
JWT_SECRET=your_jwt_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Start MongoDB
Make sure MongoDB is running on your system.

### 5. Run the Application

**Start Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Start Frontend (Terminal 2):**
```bash
npm run dev
```

## Default Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## User Roles & Features

### Employee
- Submit reimbursement requests
- View request status and remarks
- Track approval workflow

### Manager
- Review employee requests
- Approve/reject with remarks
- Email notifications sent automatically

### Finance
- Final approval for manager-approved requests
- Approve/reject with remarks
- Complete the reimbursement process

### Admin
- Manage user roles
- View system logs
- Promote/demote users

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### Reimbursements
- POST `/api/reimbursements` - Create request (Employee)
- GET `/api/reimbursements` - Get requests (Role-based)
- PATCH `/api/reimbursements/:id/status` - Update status (Manager/Finance)

### Admin
- GET `/api/admin/users` - Get all users
- PATCH `/api/admin/users/:id/role` - Update user role
- GET `/api/admin/logs` - Get system logs

## Workflow
1. Employee submits request → "Pending - Manager"
2. Manager approves → "Approved - Finance" 
3. Finance approves → "Completed"
4. Any rejection → "Rejected"
5. Email notifications at each step

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Zustand, React Router
- **Backend:** Node.js, Express, MongoDB, JWT, Nodemailer
- **Authentication:** JWT with role-based access control
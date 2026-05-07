# 16 Eyes Farm House Management System

A professional full-stack management system for farmhouse bookings, financial tracking, and reporting.

## Tech Stack

- **Frontend**: React.js (Vite), Vanilla CSS, Lucide Icons
- **Backend**: Node.js (Express), PDFKit
- **Database**: Turso (libSQL) / SQLite

## Project Structure

- `/client`: Frontend React application
- `/server`: Backend Express API

## Getting Started

### Prerequisites

- Node.js (v18+)
- Turso CLI (optional, for cloud database)

### Local Development

1. **Setup Backend**:
   - Navigate to `/server`
   - Run `npm install`
   - Create a `.env` file with `DATABASE_URL=file:local.db`
   - Run `node migrate.js` to initialize the database
   - Run `npm run dev` to start the server (default: port 3001)

2. **Setup Frontend**:
   - Navigate to `/client`
   - Run `npm install`
   - Create a `.env` file with `VITE_API_URL=http://localhost:3001/api`
   - Run `npm run dev` to start the client (default: port 5173)

### Deployment

#### Backend (Vercel)
- Deploy `/server` as a serverless function.
- Set environment variables: `DATABASE_URL`, `DATABASE_TOKEN`.

#### Frontend (Vercel)
- Deploy `/client` as a static site.
- Set environment variable: `VITE_API_URL` pointing to your deployed backend.

## Features

- **Dashboard**: Real-time stats and activity tracking.
- **Bookings**: Manage venue bookings with PDF bill generation.
- **Finance**: Track income and expenses with categorized records.
- **QR Payments**: Dynamic UPI QR code generation for payments.
- **Settings**: Configure farmhouse identity and contact info.

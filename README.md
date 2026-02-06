# Multi-Tenant ERP System

A modular, multi-tenant ERP system built with NestJS, featuring a comprehensive accounting module.

## 🎯 Features

### Core Platform

- ✅ Multi-Tenancy (tenant isolation)
- ✅ Company registration with admin user
- ✅ Modular system (enable/disable modules per company)
- ✅ Access control middleware

### Accounting Module

- ✅ Chart of Accounts
- ✅ Journal Entries (Debit = Credit validation)
- ✅ Invoices (auto-generate entries)
- ✅ Payments (auto-generate entries)
- ✅ Trial Balance

## 🛠 Tech Stack

- **Backend**: NestJS 10.x
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Frontend**: React with TypeScript
- **Authentication**: JWT

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd erp-system

# Install backend dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start backend
npm run start:dev

# In another terminal, start frontend
cd ../frontend
npm install
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db"
JWT_SECRET="your-super-secret-key"
PORT=3000
```

## 🏗 Architecture

### Modular Design

```
backend/
├── src/
│   ├── core/              # Core platform (auth, tenancy, modules)
│   ├── modules/           # Business modules (accounting, etc)
│   ├── common/            # Shared utilities
│   └── main.ts
```

### Multi-Tenancy Strategy

- Database: Single database with tenant_id column
- Middleware: Auto-inject tenant context
- Guards: Validate module access per tenant

## 🔐 API Endpoints

### Authentication

- `POST /auth/register` - Register company + admin
- `POST /auth/login` - Login user

### Companies

- `GET /companies/me` - Get current company
- `PATCH /companies/modules` - Enable/disable modules

### Accounting Module

- `POST /accounting/accounts` - Create account
- `GET /accounting/accounts` - List accounts
- `POST /accounting/entries` - Create journal entry
- `POST /accounting/invoices` - Create invoice
- `POST /accounting/payments` - Create payment
- `GET /accounting/trial-balance` - Get trial balance

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Database Schema

Key entities:

- **Tenant**: Company data
- **User**: System users
- **Module**: Available modules
- **TenantModule**: Enabled modules per tenant
- **Account**: Chart of accounts
- **JournalEntry**: Accounting entries
- **Invoice**: Sales invoices
- **Payment**: Payment records

## 🚀 Deployment

### Backend (Railway/Render)

```bash
# Build
npm run build

# Start production
npm run start:prod
```

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

## 📝 Adding New Modules

1. Create module in `src/modules/`
2. Add module metadata to database
3. Implement module guard
4. Register routes

## 🎨 Code Quality

- ESLint configured
- Prettier for formatting
- Husky for pre-commit hooks
- TypeScript strict mode

## 👨‍💻 Author

Mahmoud Sabry

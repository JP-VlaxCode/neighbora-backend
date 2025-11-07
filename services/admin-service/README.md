# Admin Service - Neighbora

Backend service for admin operations: condominiums, properties, residents, finances, publications, and incidents.

## 🏗️ Architecture

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Firebase Admin SDK
- **Code Language**: English (presentation layer in Spanish)

## 📁 Structure

```
admin-service/
├── src/
│   ├── models/           # MongoDB models (English)
│   │   ├── Condominium.ts
│   │   ├── Property.ts
│   │   ├── CommonExpense.ts
│   │   ├── Publication.ts
│   │   └── Incident.ts
│   ├── controllers/      # Route controllers
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   ├── services/         # Business logic
│   ├── config/           # Configuration
│   └── index.ts          # Entry point
├── package.json
└── tsconfig.json
```

## 🗄️ Models

### Condominium
- Basic information (name, address, city, region)
- Settings (billing cutoff, payment due days, currency)
- Contact information
- Management company details

### Property
- Unit information (number, floor, block, type)
- Owner and residents
- Financial settings (common expense percentage)
- Dimensions (square meters, bedrooms, bathrooms)

### CommonExpense
- Monthly billing per property
- Amounts breakdown (common expense, reserve fund, utilities)
- Payment tracking
- Status management (pending, paid, overdue, partial)

### Publication
- Announcements and notices
- Categories (notice, emergency, maintenance, event)
- Attachments (images, documents, videos)
- Interactions (views, reactions, comments)

### Incident
- Issue reporting and tracking
- Categories (maintenance, cleaning, security, etc.)
- Assignment and resolution workflow
- Attachments and cost tracking

## 🔐 Authentication

All routes require Firebase authentication:
- `verifyToken`: Validates Firebase ID token
- `requireAdmin`: Checks admin permissions
- `requireCondominiumAccess`: Verifies user access to condominium

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Firebase project with Admin SDK

### Installation

```bash
cd backend/services/admin-service
npm install
```

### Environment Variables

Create `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/neighbora

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
# OR
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Server
PORT=3001
NODE_ENV=development
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## 📝 API Endpoints (To be implemented)

### Condominiums
- `GET /api/condominiums` - List all condominiums
- `POST /api/condominiums` - Create condominium
- `GET /api/condominiums/:id` - Get condominium details
- `PUT /api/condominiums/:id` - Update condominium
- `DELETE /api/condominiums/:id` - Delete condominium

### Properties
- `GET /api/condominiums/:id/properties` - List properties
- `POST /api/condominiums/:id/properties` - Create property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Common Expenses
- `GET /api/condominiums/:id/expenses` - List expenses
- `POST /api/condominiums/:id/expenses` - Create expense
- `POST /api/expenses/:id/payments` - Register payment
- `GET /api/properties/:id/expenses` - Get property expenses

### Publications
- `GET /api/condominiums/:id/publications` - List publications
- `POST /api/condominiums/:id/publications` - Create publication
- `PUT /api/publications/:id` - Update publication
- `DELETE /api/publications/:id` - Delete publication

### Incidents
- `GET /api/condominiums/:id/incidents` - List incidents
- `POST /api/condominiums/:id/incidents` - Create incident
- `PUT /api/incidents/:id` - Update incident
- `POST /api/incidents/:id/assign` - Assign incident
- `POST /api/incidents/:id/resolve` - Resolve incident

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **firebase-admin**: Firebase authentication
- **cors**: CORS middleware
- **helmet**: Security headers
- **morgan**: HTTP request logger
- **express-validator**: Request validation

## 🔄 Next Steps

1. ✅ Models created (English)
2. ⏳ Create controllers
3. ⏳ Create routes
4. ⏳ Create services (business logic)
5. ⏳ Add validation
6. ⏳ Add error handling
7. ⏳ Add tests
8. ⏳ Add documentation (Swagger)

## 📖 Naming Convention

- **Code**: English (variables, functions, classes, comments)
- **Database**: English (collections, fields)
- **API**: English (endpoints, parameters)
- **Frontend/UI**: Spanish (user-facing text)

## 🤝 Contributing

Follow these guidelines:
- All code in English
- Use TypeScript strict mode
- Add JSDoc comments for public functions
- Write tests for new features
- Follow existing code style

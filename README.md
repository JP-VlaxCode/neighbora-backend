# Neighbora Backend - Monolithic Modular Architecture

Backend API for Neighbora condominium management platform.

## Architecture

**Monolithic Modular** - Single application with modular structure for easy migration to microservices later.

backend/
├── src/
│   ├── modules/
│   │   ├── admin/          # Admin operations
│   │   │   ├── models/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── user/           # User operations
│   │       ├── models/
│   │       ├── controllers/
│   │       ├── routes/
│   │       └── services/
│   ├── config/             # Configuration
│   ├── middleware/         # Auth & validation
│   ├── utils/              # Utilities
│   └── index.ts            # Entry point
├── package.json
└── tsconfig.json

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Firebase project
- **utils**: Utilidades y helpers comunes

## Stack Tecnológico

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Base de datos**: MongoDB Atlas
- **Autenticación**: JWT
- **Deployment**: Google Cloud Run
- **Testing**: Jest + Supertest

## Comandos

```bash
# Instalar dependencias en todos los servicios
npm run install:all

# Ejecutar todos los servicios en desarrollo
npm run dev:all

# Ejecutar tests
npm run test:all

# Build para producción
npm run build:all
```
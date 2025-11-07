# 🚀 Quick Start - Neighbora Backend

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias
```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Crea el archivo `.env`:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
# MongoDB (usa MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/neighbora

# Firebase Admin SDK
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Levantar el Servidor
```bash
npm run dev
```

Verás:
```
╔════════════════════════════════════════╗
║     🏢 NEIGHBORA API SERVER 🏢        ║
║  Status: ✅ Running                    ║
║  Port: 3000                            ║
║  MongoDB: ✅ Connected                 ║
║  Firebase: ✅ Initialized              ║
╚════════════════════════════════════════╝
```

### 4. Probar el API
```bash
curl http://localhost:3000/health
```

Respuesta:
```json
{
  "success": true,
  "message": "Neighbora API is running",
  "timestamp": "2025-09-30T19:00:00.000Z",
  "environment": "development"
}
```

## 📋 Configuración Detallada

### MongoDB Atlas (Gratis)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster (Free Tier M0)
4. En "Database Access", crea un usuario
5. En "Network Access", agrega tu IP (o 0.0.0.0/0 para desarrollo)
6. Copia el connection string y pégalo en `.env`

### Firebase Admin SDK

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a Project Settings → Service Accounts
4. Click "Generate new private key"
5. Guarda el JSON y copia todo el contenido
6. Pégalo en `.env` como `FIREBASE_SERVICE_ACCOUNT_KEY`

## 🧪 Probar Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Crear Condominio (requiere auth)
```bash
curl -X POST http://localhost:3000/api/admin/condominiums \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Condominio Las Flores",
    "address": "Av. Principal 123",
    "city": "Santiago",
    "region": "Metropolitana",
    "country": "Chile",
    "totalUnits": 50,
    "type": "residential"
  }'
```

### Listar Condominios
```bash
curl http://localhost:3000/api/admin/condominiums \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## 🔑 Obtener Firebase Token

Desde el frontend (después de login):
```javascript
const user = auth.currentUser;
const token = await user.getIdToken();
console.log('Token:', token);
```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── modules/
│   │   ├── admin/              # Módulo admin
│   │   │   ├── models/         # Modelos MongoDB
│   │   │   ├── controllers/    # Lógica de negocio
│   │   │   └── routes/         # Rutas API
│   │   └── user/               # Módulo usuario (próximamente)
│   ├── config/
│   │   ├── database.ts         # Conexión MongoDB
│   │   └── firebaseAdmin.ts    # Firebase Admin
│   ├── middleware/
│   │   └── auth.ts             # Autenticación
│   └── index.ts                # Servidor principal
├── package.json
├── tsconfig.json
└── .env                        # Variables de entorno
```

## 🐛 Troubleshooting

### Error: Cannot connect to MongoDB
- Verifica que tu IP esté en Network Access de MongoDB Atlas
- Verifica que el connection string sea correcto
- Verifica que el usuario/password sean correctos

### Error: Firebase Admin initialization failed
- Verifica que el JSON del service account esté completo
- Verifica que el `project_id` sea correcto
- Verifica que no haya caracteres especiales mal escapados

### Error: Port 3000 already in use
```bash
# Cambiar puerto en .env
PORT=3001
```

## 📚 Próximos Pasos

1. ✅ Backend funcionando
2. ⏳ Conectar frontend con backend
3. ⏳ Agregar más endpoints (gastos comunes, publicaciones, etc.)
4. ⏳ Agregar validaciones con express-validator
5. ⏳ Agregar tests con Jest

## 🆘 Ayuda

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que MongoDB y Firebase estén configurados correctamente

## 🎯 Endpoints Disponibles

### Admin Module
- `GET /api/admin/condominiums` - Listar condominios
- `POST /api/admin/condominiums` - Crear condominio
- `GET /api/admin/condominiums/:id` - Obtener condominio
- `PUT /api/admin/condominiums/:id` - Actualizar condominio
- `DELETE /api/admin/condominiums/:id` - Eliminar condominio

- `GET /api/admin/properties/condominium/:id` - Listar propiedades
- `POST /api/admin/properties/condominium/:id` - Crear propiedad
- `GET /api/admin/properties/:id` - Obtener propiedad
- `PUT /api/admin/properties/:id` - Actualizar propiedad
- `DELETE /api/admin/properties/:id` - Eliminar propiedad
- `POST /api/admin/properties/:id/residents` - Agregar residente

Todos los endpoints requieren:
- Header: `Authorization: Bearer <firebase-token>`
- Role: Admin (custom claims en Firebase)

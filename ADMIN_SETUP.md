# 🔐 Configuración de Roles de Administrador

Este documento explica cómo asignar y gestionar roles de administrador en la aplicación.

## ¿Cómo funciona?

Los roles de administrador se almacenan en **MongoDB** (colección `admins`). Cuando un usuario intenta acceder al panel de administración:

1. El frontend verifica si el usuario es admin
2. Llama al endpoint `/api/admin/admins/verify-admin-db`
3. El backend verifica en MongoDB si el usuario está registrado como admin
4. Si es admin, se permite el acceso; si no, se redirige al home

**Nota:** Los custom claims de Firebase se sincronizan automáticamente con MongoDB para mantener consistencia.

## Scripts disponibles (MongoDB)

### 1. Agregar admin a MongoDB

```bash
# Agregar como admin
npx ts-node scripts/add-admin-db.ts <firebaseUid> <email> [nombre] [rol]

# Ejemplos:
npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com
npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com "John Doe"
npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com "John Doe" superadmin
```

### 2. Listar todos los admins

```bash
npx ts-node scripts/list-admins-db.ts
```

### 3. Remover admin de MongoDB

```bash
npx ts-node scripts/remove-admin-db.ts <firebaseUid>

# Ejemplo:
npx ts-node scripts/remove-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1
```

## Scripts Legacy (Firebase Custom Claims)

Si prefieres usar solo Firebase Custom Claims (sin MongoDB):

### 1. Asignar rol de admin

```bash
npx ts-node scripts/set-admin-role.ts <firebaseUid> [superadmin]
```

### 2. Remover rol de admin

```bash
npx ts-node scripts/remove-admin-role.ts <firebaseUid>
```

### 3. Listar admins en Firebase

```bash
npx ts-node scripts/list-admins.ts
```

## Cómo obtener el UID de un usuario

### Opción 1: Desde Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto `neighbora-7eb80`
3. Ve a **Authentication** → **Users**
4. Busca el usuario y copia el **UID**

### Opción 2: Desde la aplicación

1. Inicia sesión con el usuario
2. Abre la consola del navegador (F12)
3. Ejecuta:
```javascript
// En la consola del navegador
const user = await firebase.auth().currentUser;
console.log(user.uid);
```

### Opción 3: Desde los logs de la aplicación

La aplicación imprime el UID cuando se autentica:
```
✅ Development mode - UID extracted from token: ph5tEoQItJWeotSRSCNlQtaBm0g1
```

## Diferencia entre Admin y Superadmin

| Característica | Admin | Superadmin |
|---|---|---|
| Acceso a panel admin | ✅ | ✅ |
| Gestionar publicaciones | ✅ | ✅ |
| Gestionar gastos | ✅ | ✅ |
| Gestionar residentes | ✅ | ✅ |
| Asignar otros admins | ❌ | ✅ |
| Cambiar configuración global | ❌ | ✅ |

## Pasos para convertirte en admin

### Opción 1: Usando MongoDB (Recomendado)

1. **Obtén tu UID y email:**
   - Inicia sesión en la aplicación
   - Abre la consola del navegador (F12)
   - Ejecuta: `console.log(firebase.auth().currentUser.uid)`
   - Copia tu UID y email

2. **Ejecuta el script:**
   ```bash
   cd backend
   npx ts-node scripts/add-admin-db.ts <TU_UID> <TU_EMAIL> "Tu Nombre"
   ```

3. **Recarga la aplicación:**
   - Cierra sesión completamente
   - Recarga la página (F5)
   - Inicia sesión nuevamente

4. **Verifica que funciona:**
   - Deberías ver el botón "Panel Admin" en el sidebar
   - Puedes acceder a `/admin`

### Opción 2: Usando Firebase Custom Claims

1. **Obtén tu UID:**
   - Inicia sesión en la aplicación
   - Abre la consola del navegador
   - Copia tu UID

2. **Ejecuta el script:**
   ```bash
   cd backend
   npx ts-node scripts/set-admin-role.ts <TU_UID>
   ```

3. **Recarga la aplicación:**
   - Cierra sesión y vuelve a iniciar sesión
   - O recarga la página (F5)

## Verificar que eres admin

### Desde MongoDB:

```bash
cd backend
npx ts-node scripts/list-admins-db.ts
```

Deberías ver tu email en la lista.

### Desde Firebase:

```bash
cd backend
npx ts-node scripts/list-admins.ts
```

## Troubleshooting

### El botón "Panel Admin" no aparece

1. Verifica que el script se ejecutó correctamente
2. Cierra sesión completamente
3. Limpia el cache del navegador (Ctrl+Shift+Delete)
4. Inicia sesión nuevamente

### El script falla con "User not found"

1. Verifica que el UID es correcto
2. Asegúrate de que el usuario existe en Firebase
3. Verifica que tienes las credenciales de Firebase configuradas en `.env`

### No puedo acceder al panel admin

1. Verifica que eres admin: `npx ts-node scripts/list-admins.ts`
2. Verifica que el backend está corriendo: `npm run dev` en la carpeta `backend`
3. Verifica que el frontend está corriendo: `npm run dev` en la carpeta `frontend`
4. Abre la consola del navegador y busca errores

## Seguridad

⚠️ **Importante:**
- Solo asigna roles de admin a usuarios de confianza
- Los custom claims se verifican en el backend
- No se pueden falsificar desde el cliente
- Los cambios pueden tomar unos minutos en reflejarse

## Variables de entorno requeridas

En `.env` del backend:

```
FIREBASE_PROJECT_ID=neighbora-7eb80
FIREBASE_SERVICE_ACCOUNT_KEY={...credenciales...}
```

Las credenciales se obtienen de:
1. Firebase Console → Project Settings
2. Service Accounts → Generate new private key
3. Copiar el contenido del JSON

## Más información

- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

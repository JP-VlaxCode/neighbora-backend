import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import { admin, initializeFirebaseAdmin } from '../src/config/firebaseAdmin';

/**
 * Script para asignar rol de admin a un usuario en Firebase
 * Uso: npx ts-node scripts/set-admin-role.ts <uid> [superadmin]
 * 
 * Ejemplos:
 * - npx ts-node scripts/set-admin-role.ts ph5tEoQItJWeotSRSCNlQtaBm0g1
 * - npx ts-node scripts/set-admin-role.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 superadmin
 */

const setAdminRole = async () => {
  try {
    // Inicializar Firebase
    initializeFirebaseAdmin();

    if (!admin.apps.length) {
      console.error('❌ Error: Firebase no está inicializado');
      console.error('Verifica que las variables de entorno estén configuradas en .env');
      process.exit(1);
    }

    const uid = process.argv[2];
    const roleType = process.argv[3] || 'admin';

    if (!uid) {
      console.error('❌ Error: Debes proporcionar el UID del usuario');
      console.log('\nUso: npx ts-node scripts/set-admin-role.ts <uid> [superadmin]');
      console.log('\nEjemplos:');
      console.log('  npx ts-node scripts/set-admin-role.ts ph5tEoQItJWeotSRSCNlQtaBm0g1');
      console.log('  npx ts-node scripts/set-admin-role.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 superadmin');
      process.exit(1);
    }

    if (roleType !== 'admin' && roleType !== 'superadmin') {
      console.error('❌ Error: El tipo de rol debe ser "admin" o "superadmin"');
      process.exit(1);
    }

    console.log(`\n🔐 Asignando rol de ${roleType} al usuario: ${uid}\n`);

    // Verificar que el usuario existe
    const user = await admin.auth().getUser(uid);
    console.log(`✅ Usuario encontrado: ${user.email}`);

    // Asignar custom claims
    const customClaims = {
      admin: roleType === 'admin' || roleType === 'superadmin',
      superadmin: roleType === 'superadmin'
    };

    await admin.auth().setCustomUserClaims(uid, customClaims);
    console.log(`✅ Custom claims asignados:`, customClaims);

    // Obtener el usuario actualizado para confirmar
    const updatedUser = await admin.auth().getUser(uid);
    console.log(`\n✅ Usuario actualizado exitosamente`);
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`🔑 UID: ${updatedUser.uid}`);
    console.log(`👤 Custom Claims:`, updatedUser.customClaims);

    console.log('\n✨ El usuario ahora puede acceder al panel de administración');
    console.log('⏱️  Nota: Puede tomar unos minutos para que los cambios se reflejen\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setAdminRole();

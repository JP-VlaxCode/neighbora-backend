import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import { admin, initializeFirebaseAdmin } from '../src/config/firebaseAdmin';

/**
 * Script para remover rol de admin de un usuario en Firebase
 * Uso: npx ts-node scripts/remove-admin-role.ts <uid>
 * 
 * Ejemplo:
 * - npx ts-node scripts/remove-admin-role.ts ph5tEoQItJWeotSRSCNlQtaBm0g1
 */

const removeAdminRole = async () => {
  try {
    // Inicializar Firebase
    initializeFirebaseAdmin();

    if (!admin.apps.length) {
      console.error('❌ Error: Firebase no está inicializado');
      console.error('Verifica que las variables de entorno estén configuradas en .env');
      process.exit(1);
    }

    const uid = process.argv[2];

    if (!uid) {
      console.error('❌ Error: Debes proporcionar el UID del usuario');
      console.log('\nUso: npx ts-node scripts/remove-admin-role.ts <uid>');
      console.log('\nEjemplo:');
      console.log('  npx ts-node scripts/remove-admin-role.ts ph5tEoQItJWeotSRSCNlQtaBm0g1');
      process.exit(1);
    }

    console.log(`\n🔐 Removiendo rol de admin del usuario: ${uid}\n`);

    // Verificar que el usuario existe
    const user = await admin.auth().getUser(uid);
    console.log(`✅ Usuario encontrado: ${user.email}`);

    // Remover custom claims
    await admin.auth().setCustomUserClaims(uid, null);
    console.log(`✅ Custom claims removidos`);

    // Obtener el usuario actualizado para confirmar
    const updatedUser = await admin.auth().getUser(uid);
    console.log(`\n✅ Usuario actualizado exitosamente`);
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`🔑 UID: ${updatedUser.uid}`);
    console.log(`👤 Custom Claims:`, updatedUser.customClaims || 'ninguno');

    console.log('\n✨ El usuario ya no puede acceder al panel de administración\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

removeAdminRole();

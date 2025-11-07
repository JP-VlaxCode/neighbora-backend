import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import { admin, initializeFirebaseAdmin } from '../src/config/firebaseAdmin';

/**
 * Script para listar todos los usuarios con rol de admin
 * Uso: npx ts-node scripts/list-admins.ts
 */

const listAdmins = async () => {
  try {
    // Inicializar Firebase
    initializeFirebaseAdmin();

    if (!admin.apps.length) {
      console.error('❌ Error: Firebase no está inicializado');
      console.error('Verifica que las variables de entorno estén configuradas en .env');
      process.exit(1);
    }

    console.log('\n🔍 Buscando usuarios con rol de admin...\n');

    let pageToken: string | undefined;
    let adminCount = 0;
    let superadminCount = 0;
    let totalUsers = 0;

    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      totalUsers += result.users.length;

      for (const user of result.users) {
        if (user.customClaims?.admin || user.customClaims?.superadmin) {
          const roleType = user.customClaims.superadmin ? 'SUPERADMIN' : 'ADMIN';
          console.log(`👤 ${roleType.padEnd(10)} | ${user.email?.padEnd(30)} | UID: ${user.uid}`);
          
          if (user.customClaims.superadmin) {
            superadminCount++;
          } else {
            adminCount++;
          }
        }
      }

      pageToken = result.pageToken;
    } while (pageToken);

    console.log(`\n📊 Resumen:`);
    console.log(`  • Superadmins: ${superadminCount}`);
    console.log(`  • Admins: ${adminCount}`);
    console.log(`  • Total de admins: ${superadminCount + adminCount}`);
    console.log(`  • Total de usuarios: ${totalUsers}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listAdmins();

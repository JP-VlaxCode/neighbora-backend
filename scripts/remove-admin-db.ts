import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../src/config/database';
import Admin from '../src/modules/admin/models/Admin';
import { admin as firebaseAdmin, initializeFirebaseAdmin } from '../src/config/firebaseAdmin';

/**
 * Script para remover un admin de MongoDB
 * Uso: npx ts-node scripts/remove-admin-db.ts <firebaseUid>
 * 
 * Ejemplo:
 * - npx ts-node scripts/remove-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1
 */

const removeAdminDB = async () => {
  try {
    // Inicializar Firebase
    initializeFirebaseAdmin();

    if (!firebaseAdmin.apps.length) {
      console.error('❌ Error: Firebase no está inicializado');
      console.error('Verifica que las variables de entorno estén configuradas en .env');
      process.exit(1);
    }

    // Conectar a MongoDB
    await connectDB();

    const firebaseUid = process.argv[2];

    if (!firebaseUid) {
      console.error('❌ Error: Debes proporcionar el Firebase UID');
      console.log('\nUso: npx ts-node scripts/remove-admin-db.ts <firebaseUid>');
      console.log('\nEjemplo:');
      console.log('  npx ts-node scripts/remove-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1');
      process.exit(1);
    }

    console.log(`\n🔐 Removiendo admin de MongoDB...\n`);

    // Buscar el admin
    const admin = await Admin.findOne({ firebaseUid });

    if (!admin) {
      console.error('❌ Error: Admin no encontrado');
      process.exit(1);
    }

    console.log(`✅ Admin encontrado: ${admin.email}`);

    // Remover de MongoDB (soft delete)
    admin.isActive = false;
    await admin.save();

    console.log(`✅ Admin removido de MongoDB`);

    // Remover custom claims de Firebase
    try {
      await firebaseAdmin.auth().setCustomUserClaims(firebaseUid, null);
      console.log(`✅ Custom claims removidos de Firebase`);
    } catch (firebaseError) {
      console.warn(`⚠️  No se pudieron remover custom claims de Firebase`);
    }

    console.log(`\n✨ Admin removido exitosamente`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Firebase UID: ${firebaseUid}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

removeAdminDB();

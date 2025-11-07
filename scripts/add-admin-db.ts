import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../src/config/database';
import Admin from '../src/modules/admin/models/Admin';
import { admin as firebaseAdmin, initializeFirebaseAdmin } from '../src/config/firebaseAdmin';

/**
 * Script para agregar un admin a MongoDB
 * Uso: npx ts-node scripts/add-admin-db.ts <firebaseUid> <email> [name] [role]
 * 
 * Ejemplos:
 * - npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com "John Doe"
 * - npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com "John Doe" superadmin
 */

const addAdminDB = async () => {
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
    const email = process.argv[3];
    const name = process.argv[4] || '';
    const role = process.argv[5] || 'admin';

    if (!firebaseUid || !email) {
      console.error('❌ Error: Debes proporcionar firebaseUid y email');
      console.log('\nUso: npx ts-node scripts/add-admin-db.ts <firebaseUid> <email> [name] [role]');
      console.log('\nEjemplos:');
      console.log('  npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com');
      console.log('  npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com "John Doe"');
      console.log('  npx ts-node scripts/add-admin-db.ts ph5tEoQItJWeotSRSCNlQtaBm0g1 user@example.com "John Doe" superadmin');
      process.exit(1);
    }

    if (role !== 'admin' && role !== 'superadmin') {
      console.error('❌ Error: El rol debe ser "admin" o "superadmin"');
      process.exit(1);
    }

    console.log(`\n🔐 Agregando admin a MongoDB...\n`);

    // Verificar que el usuario existe en Firebase
    try {
      const user = await firebaseAdmin.auth().getUser(firebaseUid);
      console.log(`✅ Usuario encontrado en Firebase: ${user.email}`);
    } catch (error) {
      console.warn(`⚠️  Usuario no encontrado en Firebase: ${firebaseUid}`);
    }

    // Verificar si ya existe en MongoDB
    const existingAdmin = await Admin.findOne({ firebaseUid });
    if (existingAdmin) {
      console.error('❌ Error: Este usuario ya es admin');
      process.exit(1);
    }

    // Crear admin en MongoDB
    const adminData = {
      firebaseUid,
      email,
      name,
      role,
      permissions: [],
      isActive: true
    };

    const newAdmin = new Admin(adminData);
    await newAdmin.save();

    console.log(`✅ Admin creado en MongoDB`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Firebase UID: ${firebaseUid}`);
    console.log(`👤 Rol: ${role}`);
    console.log(`📝 Nombre: ${name || 'N/A'}`);

    // También establecer custom claims en Firebase
    try {
      await firebaseAdmin.auth().setCustomUserClaims(firebaseUid, {
        admin: true,
        superadmin: role === 'superadmin'
      });
      console.log(`✅ Custom claims establecidos en Firebase`);
    } catch (firebaseError) {
      console.warn(`⚠️  No se pudieron establecer custom claims en Firebase`);
    }

    console.log('\n✨ Admin agregado exitosamente');
    console.log('⏱️  El usuario puede acceder al panel de administración inmediatamente\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addAdminDB();

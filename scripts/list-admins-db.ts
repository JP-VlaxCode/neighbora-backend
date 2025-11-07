import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from '../src/config/database';
import Admin from '../src/modules/admin/models/Admin';

/**
 * Script para listar todos los admins en MongoDB
 * Uso: npx ts-node scripts/list-admins-db.ts
 */

const listAdminsDB = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();

    console.log('\n🔍 Buscando admins en MongoDB...\n');

    const admins = await Admin.find({ isActive: true }).sort({ createdAt: -1 });

    if (admins.length === 0) {
      console.log('❌ No hay admins registrados\n');
      process.exit(0);
    }

    console.log('👤 ADMINS REGISTRADOS:\n');
    console.log('┌─────────────────────────────────────────────────────────────────────┐');
    console.log('│ ROL        │ EMAIL                    │ NOMBRE                      │');
    console.log('├─────────────────────────────────────────────────────────────────────┤');

    let adminCount = 0;
    let superadminCount = 0;

    for (const admin of admins) {
      const roleDisplay = admin.role === 'superadmin' ? 'SUPERADMIN' : 'ADMIN';
      const email = admin.email.padEnd(24);
      const name = (admin.name || 'N/A').substring(0, 27).padEnd(27);

      console.log(`│ ${roleDisplay.padEnd(10)} │ ${email} │ ${name} │`);

      if (admin.role === 'superadmin') {
        superadminCount++;
      } else {
        adminCount++;
      }
    }

    console.log('└─────────────────────────────────────────────────────────────────────┘');

    console.log(`\n📊 RESUMEN:`);
    console.log(`  • Superadmins: ${superadminCount}`);
    console.log(`  • Admins: ${adminCount}`);
    console.log(`  • Total: ${admins.length}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listAdminsDB();

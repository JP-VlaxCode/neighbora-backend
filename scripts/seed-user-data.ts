import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Condominium from '../src/modules/admin/models/Condominium';
import Property from '../src/modules/admin/models/Property';

dotenv.config();

// Use the UID from your Firebase user
const USER_UID = process.argv[2] || 'ph5tEoQItJWeotSRSCNlQtaBm0g1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/neighbora?authSource=admin';

async function seedData() {
  try {
    console.log('🌱 Iniciando seed de datos...');
    
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear condominio
    const condominium = await Condominium.create({
      name: 'Condominio Neighbora',
      address: 'Calle Principal 123',
      city: 'Santiago',
      region: 'Metropolitana',
      country: 'Chile',
      totalUnits: 50,
      type: 'residential',
      settings: {
        billingCutoffDay: 1,
        paymentDueDays: 10,
        currency: 'CLP',
        timezone: 'America/Santiago',
        language: 'es'
      },
      contact: {
        phone: '+56 2 1234 5678',
        email: 'admin@neighbora.cl',
        website: 'www.neighbora.cl'
      },
      management: {
        companyName: 'Administración Neighbora',
        companyTaxId: '12.345.678-9',
        companyContact: 'admin@neighbora.cl'
      },
      isActive: true,
      createdBy: USER_UID
    });

    console.log('✅ Condominio creado:', condominium._id);

    // Crear propiedad
    const property = await Property.create({
      condominiumId: condominium._id,
      number: '402',
      floor: 4,
      block: 'Torre A',
      type: 'apartment',
      squareMeters: 85,
      bedrooms: 3,
      bathrooms: 2,
      owner: {
        firebaseUid: USER_UID,
        name: 'Usuario Neighbora',
        email: 'user@example.com',
        phone: '+56 9 1234 5678',
        startDate: new Date()
      },
      residents: [
        {
          firebaseUid: USER_UID,
          name: 'Usuario Neighbora',
          email: 'user@example.com',
          phone: '+56 9 1234 5678',
          relationship: 'owner',
          startDate: new Date(),
          isActive: true
        }
      ],
      financialSettings: {
        commonExpensePercentage: 2.0,
        isExempt: false,
        notes: 'Propiedad de prueba'
      },
      isActive: true,
      createdBy: USER_UID
    });

    console.log('✅ Propiedad creada:', property._id);

    console.log('\n✨ Seed completado exitosamente!');
    console.log('📊 Datos creados:');
    console.log(`   - Condominio: ${condominium.name}`);
    console.log(`   - Propiedad: Unidad ${property.number}, ${property.block}`);
    console.log(`   - Usuario UID: ${USER_UID}`);

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedData();

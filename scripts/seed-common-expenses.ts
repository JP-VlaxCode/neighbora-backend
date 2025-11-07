import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Condominium from '../src/modules/admin/models/Condominium';
import Property from '../src/modules/admin/models/Property';
import CommonExpense from '../src/modules/admin/models/CommonExpense';

const FIREBASE_UID = 'ph5tEoQItJWeotSRSCNlQtaBm0g1';

async function seedCommonExpenses() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/neighbora?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the condominium
    const condominium = await Condominium.findOne({ name: 'Condominio Alta Vista del Peñon' });
    if (!condominium) {
      console.error('❌ Condominium not found');
      console.error('Available condominiums:');
      const allCondos = await Condominium.find({}, 'name');
      allCondos.forEach(c => console.error(`  - ${c.name}`));
      process.exit(1);
    }
    console.log('✅ Found condominium:', condominium.name);

    // Find the property for the user
    const property = await Property.findOne({
      condominiumId: condominium._id,
      $or: [
        { 'owner.firebaseUid': FIREBASE_UID },
        { 'residents.firebaseUid': FIREBASE_UID }
      ]
    });

    if (!property) {
      console.error('❌ Property not found for user');
      process.exit(1);
    }
    console.log('✅ Found property:', property.number, property.block);

    // Delete existing common expenses for this property
    await CommonExpense.deleteMany({ propertyId: property._id });
    console.log('🗑️  Cleared existing common expenses');

    // Create common expenses for the last 6 months
    const expenses = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const issueDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const dueDate = new Date(date.getFullYear(), date.getMonth(), 30);

      // Vary the amounts slightly
      const baseAmount = 185723;
      const variance = Math.floor(Math.random() * 10000) - 5000;
      const total = baseAmount + variance;

      // Create expense details
      const expenseDetails = [
        {
          concept: 'Gastos Comunes Básicos',
          category: 'Servicios',
          amount: Math.floor(total * 0.45),
          percentage: 45
        },
        {
          concept: 'Fondo de Reserva',
          category: 'Reserva',
          amount: Math.floor(total * 0.25),
          percentage: 25
        },
        {
          concept: 'Seguro Edificio',
          category: 'Seguros',
          amount: Math.floor(total * 0.15),
          percentage: 15
        },
        {
          concept: 'Administración',
          category: 'Administración',
          amount: Math.floor(total * 0.15),
          percentage: 15
        }
      ];

      // Determine status and payments based on month
      let status = 'pending';
      let payments: any[] = [];

      if (i > 2) {
        // Older expenses are paid
        status = 'paid';
        payments = [
          {
            amount: total,
            paymentDate: new Date(dueDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days after due
            paymentMethod: i % 3 === 0 ? 'transfer' : i % 3 === 1 ? 'webpay' : 'check',
            registeredBy: FIREBASE_UID
          }
        ];
      } else if (i === 2) {
        // Current month - paid
        status = 'paid';
        payments = [
          {
            amount: total,
            paymentDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            paymentMethod: 'transfer',
            registeredBy: FIREBASE_UID
          }
        ];
      } else if (i === 1) {
        // Last month - partial
        status = 'partial';
        payments = [
          {
            amount: Math.floor(total * 0.5),
            paymentDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
            paymentMethod: 'transfer',
            registeredBy: FIREBASE_UID
          }
        ];
      }
      // i === 0 (current month) stays pending

      const expense = {
        condominiumId: condominium._id,
        propertyId: property._id,
        period,
        amounts: {
          commonExpense: Math.floor(total * 0.45),
          reserveFund: Math.floor(total * 0.25),
          water: 0,
          gas: 0,
          other: 0,
          total
        },
        issueDate,
        dueDate,
        status,
        payments,
        expenseDetails,
        createdBy: 'system',
        notes: `Gasto común para ${period}`
      };

      expenses.push(expense);
    }

    // Insert expenses
    const result = await CommonExpense.insertMany(expenses);
    console.log(`✅ Created ${result.length} common expenses`);

    // Display summary
    console.log('\n📊 Common Expenses Summary:');
    console.log('─'.repeat(50));
    expenses.forEach((exp, idx) => {
      console.log(`${exp.period}: $${exp.amounts.total.toLocaleString()} - ${exp.status.toUpperCase()}`);
    });

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding common expenses:', error);
    process.exit(1);
  }
}

seedCommonExpenses();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Condominium from '../src/modules/admin/models/Condominium';
import Publication from '../src/modules/admin/models/Publication';

async function seedPublications() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/neighbora?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the condominium
    const condominium = await Condominium.findOne({ name: 'Condominio Alta Vista del Peñon' });
    if (!condominium) {
      console.error('❌ Condominium not found');
      process.exit(1);
    }
    console.log('✅ Found condominium:', condominium.name);

    // Delete existing publications
    await Publication.deleteMany({ condominiumId: condominium._id });
    console.log('🗑️  Cleared existing publications');

    // Create sample publications
    const publications = [
      {
        condominiumId: condominium._id,
        title: 'Asamblea Extraordinaria - Noviembre 2025',
        content: 'Se convoca a asamblea extraordinaria para el día 15 de noviembre a las 19:00 hrs en el salón de eventos. Temas a tratar: presupuesto anual 2026, proyectos de mejora para áreas comunes, renovación del contrato de seguridad y votación para la instalación de cámaras adicionales en estacionamientos.',
        category: 'event',
        priority: 'high',
        author: {
          firebaseUid: 'admin-001',
          name: 'Administración',
          role: 'admin'
        },
        attachments: [],
        isVisible: true,
        publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        views: 45,
        reactions: [],
        comments: [],
        isActive: true,
        createdBy: 'admin-001'
      },
      {
        condominiumId: condominium._id,
        title: 'Cambio de Horario - Sistema de Calefacción',
        content: 'A partir del lunes 10 de noviembre, el sistema de calefacción central funcionará en horario de invierno: de 07:00 a 09:00 hrs y de 19:00 a 22:00 hrs. Este cambio busca optimizar el consumo energético y reducir los costos en gastos comunes.',
        category: 'notice',
        priority: 'medium',
        author: {
          firebaseUid: 'admin-001',
          name: 'Administración',
          role: 'admin'
        },
        attachments: [],
        isVisible: true,
        publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        views: 32,
        reactions: [],
        comments: [],
        isActive: true,
        createdBy: 'admin-001'
      },
      {
        condominiumId: condominium._id,
        title: 'Trabajos de Mantención - Ascensores',
        content: 'Durante la semana del 17 al 21 de noviembre se realizarán trabajos de mantención preventiva en todos los ascensores del edificio. Los trabajos se ejecutarán entre las 09:00 y 17:00 hrs. Se habilitará ascensor de emergencia durante este período.',
        category: 'maintenance',
        priority: 'high',
        author: {
          firebaseUid: 'admin-001',
          name: 'Administración',
          role: 'admin'
        },
        attachments: [],
        isVisible: true,
        publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        views: 28,
        reactions: [],
        comments: [],
        isActive: true,
        createdBy: 'admin-001'
      },
      {
        condominiumId: condominium._id,
        title: 'Corte Programado de Agua',
        content: 'La empresa sanitaria informa corte programado de agua potable el sábado 8 de noviembre de 08:00 a 14:00 hrs para trabajos de mejoramiento de la red. Se recomienda almacenar agua con anticipación.',
        category: 'emergency',
        priority: 'urgent',
        author: {
          firebaseUid: 'admin-001',
          name: 'Administración',
          role: 'admin'
        },
        attachments: [],
        isVisible: true,
        publishDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        views: 67,
        reactions: [
          {
            firebaseUid: 'user-001',
            type: 'important',
            date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
          }
        ],
        comments: [],
        isActive: true,
        createdBy: 'admin-001'
      },
      {
        condominiumId: condominium._id,
        title: 'Respuesta Municipal - Mejoramiento Alumbrado',
        content: 'La municipalidad ha respondido favorablemente a nuestros requerimientos sobre el mejoramiento del alumbrado público en el sector. Los trabajos comenzarán la primera semana de diciembre y tendrán una duración aproximada de 15 días.',
        category: 'general',
        priority: 'low',
        author: {
          firebaseUid: 'admin-001',
          name: 'Administración',
          role: 'admin'
        },
        attachments: [],
        isVisible: true,
        publishDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        views: 23,
        reactions: [],
        comments: [
          {
            firebaseUid: 'user-001',
            userName: 'Juan García',
            content: 'Excelente noticia para el sector',
            date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
            isEdited: false
          }
        ],
        isActive: true,
        createdBy: 'admin-001'
      },
      {
        condominiumId: condominium._id,
        title: 'Nuevo Reglamento de Mascotas',
        content: 'Se informa a todos los residentes que a partir del 1 de diciembre entrará en vigencia el nuevo reglamento de mascotas aprobado en la última asamblea. Las principales modificaciones incluyen horarios específicos para paseos en áreas comunes y registro obligatorio de mascotas.',
        category: 'notice',
        priority: 'medium',
        author: {
          firebaseUid: 'admin-001',
          name: 'Administración',
          role: 'admin'
        },
        attachments: [],
        isVisible: true,
        publishDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        views: 41,
        reactions: [],
        comments: [],
        isActive: true,
        createdBy: 'admin-001'
      }
    ];

    // Insert publications
    const result = await Publication.insertMany(publications);
    console.log(`✅ Created ${result.length} publications`);

    // Display summary
    console.log('\n📊 Publications Summary:');
    console.log('─'.repeat(50));
    publications.forEach((pub, idx) => {
      console.log(`${idx + 1}. ${pub.title}`);
      console.log(`   Categoría: ${pub.category} | Prioridad: ${pub.priority}`);
    });

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding publications:', error);
    process.exit(1);
  }
}

seedPublications();

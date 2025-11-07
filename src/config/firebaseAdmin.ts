import admin from 'firebase-admin';

// Inicializar Firebase Admin
const initializeFirebaseAdmin = () => {
  try {
    // Skip Firebase initialization if not configured
    if (!process.env.FIREBASE_PROJECT_ID && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('⚠️  Firebase Admin not configured - skipping initialization');
      console.log('   Authentication will be disabled');
      return null;
    }

    // Verificar si ya está inicializado
    if (admin.apps.length > 0) {
      console.log('✅ Firebase Admin ya inicializado');
      return admin.app();
    }

    // Inicializar con credenciales del service account
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin inicializado correctamente');
    return admin.app();
  } catch (error) {
    console.error('⚠️  Error al inicializar Firebase Admin:', error);
    console.log('   Continuando sin autenticación...');
    return null;
  }
};

export { admin, initializeFirebaseAdmin };

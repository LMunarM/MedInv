import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('MONGODB_URI no está configurada en el archivo .env');
  }

  if (uri.includes('@mydeployment.')) {
    throw new Error(
      'MONGODB_URI todavía usa el host de ejemplo "mydeployment". ' +
      'Copia la cadena de conexión real desde MongoDB Atlas.'
    );
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Error de conexión a MongoDB: ${message}`, { cause: error });
  }
};
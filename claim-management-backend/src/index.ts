import "dotenv/config";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "./app";
import { seedDevelopmentData } from "./seeds/dev.seed";

const app = createApp();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI ?? process.env.MONGO_URI;
const isDevSeedMode = process.argv.includes("--dev-seed");

async function connectExternalMongo() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB using MONGODB_URI`);
  return null;
}

async function connectEphemeralMongo() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  console.log(`Starting ephemeral MongoDB for development`);
  console.log(`MongoDB URI: ${mongoUri}`);

  await mongoose.connect(mongoUri);
  return mongoServer;
}

async function shutdown(mongoServer: MongoMemoryServer | null) {
  await mongoose.connection.close();
  await mongoServer?.stop();
}

async function startServer() {
  let mongoServer: MongoMemoryServer | null = null;
  try {
    if (isDevSeedMode) {
      mongoServer = await connectEphemeralMongo();
      await seedDevelopmentData();
      console.log(`Development database reset and reseeded`);
    } else {
      await connectExternalMongo();
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    const gracefulShutdown = async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      await shutdown(mongoServer);
      process.exit(0);
    };

    process.once("SIGINT", gracefulShutdown);
    process.once("SIGTERM", gracefulShutdown);
  } catch (error) {
    await shutdown(mongoServer);
    throw error;
  }
}

startServer().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

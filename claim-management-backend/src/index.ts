import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app";

const app = createApp();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB using MONGODB_URI`);
}

async function shutdown() {
  await mongoose.connection.close();
}

async function startServer() {
  try {
    await connectMongo();

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

      await shutdown();
      process.exit(0);
    };

    process.once("SIGINT", gracefulShutdown);
    process.once("SIGTERM", gracefulShutdown);
  } catch (error) {
    await shutdown();
    throw error;
  }
}

startServer().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

import express, { Express, Request, Response } from "express";
import { errorHandler } from "./middleware/index.js";
import router from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();

//Initialize and start the Express application
export async function initServer(): Promise<Express> {
  // Initialize Express app
  const app: Express = express();
  const port: number = Number(process.env.PORT) ?? 3000;

  // Middleware
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Root endpoint
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "✅ Server is running!", status: "ok" });
  });

  // API routes
  app.use("/api", router);

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  app.listen(port, () => {
    console.log("🚀 Starting x402 Server");
    console.log(`💰 Receiver: ${process.env.RECEIVER}`);

    console.log(`\n✅ Server running: http://localhost:${port}`);
    console.log(`   GET /               - Check Health`);
    console.log(`   GET /api/free       - Free trending tokens`);
    console.log(`   GET /api/premium    - $10 for premium tokens`);
    console.log(`\n💡 Run "npm run start:client" to test \n`);
  });

  return app;
}

// Initialize the application
initServer().catch((err: any) => {
  console.error("Failed to start Express server.");
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutdown request received, shutting down gracefully'");
  process.exit(0);
});

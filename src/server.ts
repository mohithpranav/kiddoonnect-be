import express from "express";
import { router } from "./routes/routes";
import cors from "cors";

const app = express();

// Update CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:8082",
      "http://localhost:8083",
      "http://localhost:8084",
      "http://localhost:3000",
    ], // Add all your frontend URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight request results for 24 hours
  })
);

// Make sure CORS is applied before any routes
app.use(express.json({ limit: "50mb" })); // Increase payload limit for images
app.use("/api", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

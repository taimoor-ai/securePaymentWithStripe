import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import paymentRoutes from "./routes/paymentRoutes.js";

import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(express.json());

app.use(cors());
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);

export default app;
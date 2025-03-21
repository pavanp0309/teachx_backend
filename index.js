import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // ✅ Import Admin Routes
import liveClassRoutes from "./routes/liveClassRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
// import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // ✅ Register Admin Routes
app.use("/api/live-classes", liveClassRoutes);

app.use("/api/batches", batchRoutes);

// 🛠 Error Handling Middleware
// app.use(notFound);
// app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`✅ Server running on port ${process.env.PORT}`));

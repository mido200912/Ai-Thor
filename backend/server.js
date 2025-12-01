import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import companyRoutes from "./routes/Company.js";
import publicCompanyChatRoutes from "./routes/publicCompanyChat.js";
import integrationRoutes from "./routes/integrationRoutes.js";

dotenv.config();
const app = express();

// ✅ إعداد CORS مفتوح لأي موقع
app.use(cors({
  origin: "*", // أي دومين
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ دعم preflight requests (الـ OPTIONS)


app.use(express.json());

// ✅ Routes
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/public", publicCompanyChatRoutes);
app.use("/api/integrations", integrationRoutes);

// ✅ Route افتراضي
app.get("/", (req, res) => {
  res.send("AiThor API is running");
});

// ✅ التعامل مع الأخطاء
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ success: false, error: err.message });
});

// ✅ اتصال قاعدة البيانات
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ Mongo Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

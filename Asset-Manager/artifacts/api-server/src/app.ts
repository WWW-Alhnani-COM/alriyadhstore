import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// إعدادات CORS المتقدمة للسماح بالجلسات عبر النطاقات
app.use(cors({
  origin: 'https://riyadhstore.vercel.app', // النطاق المسموح
  credentials: true, // السماح بإرسال Cookies
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'], // الرؤوس المسموحة
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // الطرق المسموحة
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env["SESSION_SECRET"] ?? "dev-only-secret-change-me";

app.use(
  session({
    name: "store.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "none",     // أساسي للجلسات عبر النطاقات
      secure: true,         // أساسي لـ HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use("/api", router);

export default app;

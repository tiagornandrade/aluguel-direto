import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "../lib/env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { propertiesRouter } from "./routes/properties";
import { contractsRouter } from "./routes/contracts";
import { notificationsRouter } from "./routes/notifications";
import { usersRouter } from "./routes/users";

const app = express();
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.use(express.json());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/properties", propertiesRouter);
app.use("/api/v1/contracts", contractsRouter);
app.use("/api/v1/notifications", notificationsRouter);

app.listen(env.PORT, () => {
  console.log(`Backend running at http://localhost:${env.PORT}`);
});

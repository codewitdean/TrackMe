import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRoutes } from "./routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`TrackMe API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start TrackMe API", error);
  process.exit(1);
});

export { app };

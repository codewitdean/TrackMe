import { Router } from "express";
import { adminRoutes } from "./adminRoutes";
import { authRoutes } from "./authRoutes";
import { habitRoutes } from "./habitRoutes";
import { logRoutes } from "./logRoutes";
import { nlpRoutes } from "./nlpRoutes";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "TrackMe API"
  });
});

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/habits", habitRoutes);
apiRoutes.use("/logs", logRoutes);
apiRoutes.use("/nlp", nlpRoutes);
apiRoutes.use("/admin", adminRoutes);

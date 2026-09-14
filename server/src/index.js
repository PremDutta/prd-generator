import "dotenv/config";
import express from "express";
import cors from "cors";

import configRoutes from "./routes/config.js";
import prdsRoutes from "./routes/prds.js";
import generateRoutes from "./routes/generate.js";
import exportRoutes from "./routes/export.js";
import { prdsRouter as shareOnPrds, sharedRouter } from "./routes/share.js";
import { prdsRouter as commentsOnPrds, sharedRouter as commentsOnShared } from "./routes/comments.js";
import qualityRoutes from "./routes/quality.js";
import { serveFrontend } from "./static.js";

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/config", configRoutes);
app.use("/api/prds", prdsRoutes);
app.use("/api/prds", generateRoutes);
app.use("/api/prds", exportRoutes);
app.use("/api/prds", shareOnPrds);
app.use("/api/prds", commentsOnPrds);
app.use("/api/prds", qualityRoutes);
app.use("/api/shared", sharedRouter);
app.use("/api/shared", commentsOnShared);

serveFrontend(app);

app.listen(PORT, () => {
  console.log(`PRD Generator API listening on http://localhost:${PORT}`);
});

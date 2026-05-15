import express from "express";
import cors from "cors";

import { signupHandler } from "./routes/signup";
import { loginHandler } from "./routes/login";

import { requireAuth } from "./core/auth/middleware";

import { bbHandler } from "./routes/bb";
import { benefitsHandler } from "./routes/benefits";
import { resourcesHandler } from "./routes/resources";
import { workflowsHandler } from "./routes/workflows";

const app = express();
app.use(cors());
app.use(express.json());

// Public
app.post("/auth/signup", signupHandler);
app.post("/auth/login", loginHandler);

// Protected
app.post("/bb", requireAuth, bbHandler);
app.get("/benefits", requireAuth, benefitsHandler);
app.get("/resources", requireAuth, resourcesHandler);
app.get("/workflows", requireAuth, workflowsHandler);

app.listen(3001, () => {
  console.log("Pathway3.0 API running on port 3001");
});

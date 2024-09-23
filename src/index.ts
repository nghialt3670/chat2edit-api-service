import express from "express";
import attachmentRouter from "./routes/attachment-route";
import morganMiddleware from "./middlewares/morgan";
import { logError } from "./utils/error";
import ENV from "./utils/env";

const app = express();

app.use(morganMiddleware);
app.use(express.json());
app.use("/api", attachmentRouter);

app.listen(ENV.PORT, () => {
  console.log(`Server started on port ${ENV.PORT}`);
});

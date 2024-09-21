import express from "express";
import attachmentRouter from "./routes/attachment-route";
import ENV from "./utils/env";

const app = express();

app.use(express.json());
app.use(attachmentRouter);

app.listen(ENV.PORT, () => {
  console.log(`Server started on port ${ENV.PORT}`);
});

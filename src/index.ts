import express from "express";
import attachmentRouter from "./routes/attachment.route";
import morgan from "./middlewares/morgan.middleware";
import accountRouter from "./routes/account.route";
import chatRouter from "./routes/chat.route";
import connectToDatabase from "./lib/db";
import ENV from "./utils/env";

const app = express();

app.use(morgan);
app.use(express.json());

app.use("/api", chatRouter);
app.use("/api", accountRouter);
app.use("/api", attachmentRouter);

app.listen(ENV.PORT, async () => {
  await connectToDatabase();
  console.log(`Server started on port ${ENV.PORT}`);
});

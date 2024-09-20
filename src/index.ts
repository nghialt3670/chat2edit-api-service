import express from "express";
import dotenv from "dotenv";
import attachmentRouter from "./routes/attachment-route";

dotenv.config();

const app = express();

app.use(express.json());
app.use(attachmentRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

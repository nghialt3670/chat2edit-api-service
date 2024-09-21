import { configDotenv } from "dotenv";
import environmentSchema from "../schemas/environment-schema";

configDotenv();

const ENV = environmentSchema.parse(process.env);

export default ENV;

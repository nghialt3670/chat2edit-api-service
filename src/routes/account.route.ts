import { Router } from "express";
import { signIn } from "../controllers/account.controller";

const router = Router();

router.post("/sign-in", signIn);

export default router;

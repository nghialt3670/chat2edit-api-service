import { Request, Response } from "express";
import signInResponseSchema from "../schemas/response/sign-in.response.schema";
import signInRequestSchema from "../schemas/request/sign-in.request.schema";
import Account from "../models/account";
import handler from "../utils/handler";
import User from "../models/user";

export const signIn = handler(
  signInRequestSchema,
  async (req: Request, res: Response) => {
    const { user: userCreate, account: accountCreate } = req.body;

    const { email } = userCreate;
    let user = await User.findOne({ email });
    if (!user) user = await User.create(userCreate);

    const { providerAccountId } = accountCreate;
    let account = await Account.findOne({ providerAccountId });
    if (!account) {
      accountCreate.userId = user.id;
      account = await Account.create(accountCreate);
    }

    const payload = signInResponseSchema.parse({
      userId: user._id.toString(),
      accountId: account._id.toString(),
    });

    return res.status(200).json(payload);
  },
);

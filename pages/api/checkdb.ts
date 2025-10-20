import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/mongodb";

type Data = { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const message = await connectDB();
  res.status(200).json({ message });
}

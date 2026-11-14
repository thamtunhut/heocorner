// Vercel Serverless Function — mọi đường dẫn /api/* được rewrite về đây (xem vercel.json).
import { handle } from "../lib/router.js";

export default function handler(req, res) {
  return handle(req, res);
}

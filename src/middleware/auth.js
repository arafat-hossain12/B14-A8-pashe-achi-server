import jwt from "jsonwebtoken";

// Verifies the Bearer token issued by the Next.js client (same JWT_SECRET).
export function verifyJWT(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: token missing" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { email: payload.email, name: payload.name, photo: payload.picture };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
  }
}

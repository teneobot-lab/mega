import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Silakan login terlebih dahulu" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Token tidak valid atau sesi berakhir" });
    (req as any).user = user;
    next();
  });
};

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses ke fitur ini" });
    }
    next();
  };
};

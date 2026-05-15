import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ message: "Kredensial tidak valid atau akun dinonaktifkan." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Kredensial tidak valid." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, roleName } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let role = await prisma.role.findUnique({ where: { name: roleName || "User" } });
    if (!role) {
      role = await prisma.role.create({ data: { name: roleName || "User" } });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id
      }
    });

    res.json({ message: "Registrasi berhasil", userId: user.id });
  } catch (error) {
    res.status(500).json({ message: "Gagal registrasi" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch(e) {}
  }
  res.clearCookie("token");
  res.json({ message: "Logout berhasil" });
};

export const getMe = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Unauthenticated" });
  
  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, name: true, email: true, role: { select: { name: true } } }
    });
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

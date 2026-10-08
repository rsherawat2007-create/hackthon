import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { HttpError } from "../utils/errors.js";
import { refreshCreatorTrust } from "../services/verification.js";

const portfolioSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().min(10).max(5000),
  mediaUrl: z.string().min(4).max(2000),
  thumbnailUrl: z.string().min(4).max(2000),
  contentType: z.string().min(1),
  toolsUsed: z.array(z.string()).default([]),
  aiModelsUsed: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  aspectRatio: z.string().default("16:9"),
  commercialUse: z.boolean().default(true),
  date: z.string().optional(),
  category: z.string().default(""),
  workflow: z.string().default(""),
});

async function requireCreatorProfile(userId: string) {
  const profile = await prisma.creatorProfile.findUnique({ where: { userId } });
  if (!profile) throw new HttpError(400, "Create your creator profile first");
  return profile;
}

export async function listPortfolio(req: Request, res: Response) {
  const items = await prisma.portfolio.findMany({
    where: { creatorId: req.params.creatorId },
    orderBy: { date: "desc" },
  });
  res.json({ portfolio: items });
}

export async function getPortfolioItem(req: Request, res: Response) {
  const item = await prisma.portfolio.findUnique({
    where: { id: req.params.id },
    include: {
      creator: {
        include: { user: { select: { id: true, name: true } }, verification: true },
      },
    },
  });
  if (!item) throw new HttpError(404, "Portfolio item not found");
  res.json({ item });
}

export async function createPortfolio(req: Request, res: Response) {
  const profile = await requireCreatorProfile(req.user!.userId);
  const data = portfolioSchema.parse(req.body);
  const item = await prisma.portfolio.create({
    data: {
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      creatorId: profile.id,
    },
  });
  await refreshCreatorTrust(profile.id);
  res.status(201).json({ item });
}

export async function updatePortfolio(req: Request, res: Response) {
  const profile = await requireCreatorProfile(req.user!.userId);
  const existing = await prisma.portfolio.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.creatorId !== profile.id) throw new HttpError(404, "Portfolio item not found");
  const data = portfolioSchema.partial().parse(req.body);
  const item = await prisma.portfolio.update({
    where: { id: req.params.id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
  });
  await refreshCreatorTrust(profile.id);
  res.json({ item });
}

export async function deletePortfolio(req: Request, res: Response) {
  const profile = await requireCreatorProfile(req.user!.userId);
  const existing = await prisma.portfolio.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.creatorId !== profile.id) throw new HttpError(404, "Portfolio item not found");
  await prisma.portfolio.delete({ where: { id: req.params.id } });
  await refreshCreatorTrust(profile.id);
  res.json({ ok: true });
}

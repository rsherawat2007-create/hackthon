import { z } from "zod";
import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { HttpError } from "../utils/errors.js";
import { publicCreatorSelect, refreshCreatorTrust } from "../services/verification.js";
import { computeMatchScore, type MatchQuery } from "../matching/score.js";

const profileSchema = z.object({
  headline: z.string().max(140).optional(),
  bio: z.string().max(4000).optional(),
  location: z.string().max(120).optional(),
  avatarUrl: z.string().max(2000).optional(),
  experience: z.string().max(80).optional(),
  experienceYears: z.number().int().min(0).max(40).optional(),
  commercialUse: z.boolean().optional(),
  commercialNotes: z.string().max(2000).optional(),
  workflow: z.string().max(8000).optional(),
  skills: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  aiModels: z.array(z.string()).optional(),
  contentTypes: z.array(z.string()).optional(),
});

function parseList(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseQuery(req: Request): MatchQuery {
  const commercial = req.query.commercialUse;
  return {
    keyword: typeof req.query.keyword === "string" ? req.query.keyword : typeof req.query.q === "string" ? req.query.q : "",
    skills: parseList(req.query.skill as string | undefined),
    specializations: parseList(req.query.specialization as string | undefined),
    tools: parseList(req.query.tool as string | undefined),
    contentTypes: parseList(req.query.contentType as string | undefined),
    commercialUse:
      commercial === "true" ? true : commercial === "false" ? false : null,
    experienceYearsMin: req.query.experience ? Number(req.query.experience) : null,
  };
}

export async function listCreators(req: Request, res: Response) {
  const query = parseQuery(req);
  const where: Record<string, unknown> = {};
  if (query.commercialUse === true) where.commercialUse = true;
  if (query.experienceYearsMin) where.experienceYears = { gte: query.experienceYearsMin };
  if (query.skills?.length) where.skills = { hasSome: query.skills };
  if (query.specializations?.length) where.specializations = { hasSome: query.specializations };
  if (query.tools?.length) where.tools = { hasSome: query.tools };
  if (query.contentTypes?.length) where.contentTypes = { hasSome: query.contentTypes };

  const creators = await prisma.creatorProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      portfolio: { orderBy: { date: "desc" }, take: 4 },
      verification: true,
    },
  });

  const ranked = creators
    .map((c) => {
      const match = computeMatchScore(c, query);
      return { ...c, match };
    })
    .sort((a, b) => b.match.total - a.match.total);

  if (req.user?.role === "BRAND") {
    const brand = await prisma.brandProfile.findUnique({ where: { userId: req.user.userId } });
    if (brand) {
      await prisma.searchHistory.create({
        data: {
          brandId: brand.id,
          query: query.keyword || "",
          filters: query as object,
        },
      });
    }
  }

  res.json({ results: ranked, count: ranked.length, query });
}

export async function getCreator(req: Request, res: Response) {
  const creator = await prisma.creatorProfile.findFirst({
    where: { OR: [{ id: req.params.id }, { userId: req.params.id }] },
    select: publicCreatorSelect(),
  });
  if (!creator) throw new HttpError(404, "Creator not found");

  const query = parseQuery(req);
  const match = computeMatchScore(creator, query);
  res.json({ creator: { ...creator, match } });
}

export async function upsertMyProfile(req: Request, res: Response) {
  if (req.user!.role !== "CREATOR") throw new HttpError(403, "Creator role required");
  const data = profileSchema.parse(req.body);
  const profile = await prisma.creatorProfile.upsert({
    where: { userId: req.user!.userId },
    update: data,
    create: {
      userId: req.user!.userId,
      headline: data.headline || "",
      bio: data.bio || "",
      location: data.location || "",
      avatarUrl: data.avatarUrl || "",
      experience: data.experience || "",
      experienceYears: data.experienceYears || 0,
      commercialUse: data.commercialUse ?? true,
      commercialNotes: data.commercialNotes || "",
      workflow: data.workflow || "",
      skills: data.skills || [],
      specializations: data.specializations || [],
      tools: data.tools || [],
      aiModels: data.aiModels || [],
      contentTypes: data.contentTypes || [],
    },
  });
  await refreshCreatorTrust(profile.id);
  const fresh = await prisma.creatorProfile.findUnique({
    where: { id: profile.id },
    select: publicCreatorSelect(),
  });
  res.json({ profile: fresh });
}

export async function matchCreators(req: Request, res: Response) {
  const body = z
    .object({
      keyword: z.string().optional(),
      skills: z.array(z.string()).optional(),
      specializations: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
      contentTypes: z.array(z.string()).optional(),
      commercialUse: z.boolean().nullable().optional(),
      briefId: z.string().optional(),
    })
    .parse(req.body);

  let query: MatchQuery = body;
  if (body.briefId) {
    const brief = await prisma.brief.findUnique({ where: { id: body.briefId } });
    if (brief) {
      query = {
        keyword: `${brief.title} ${brief.contentType} ${brief.style}`,
        skills: brief.requiredSkills,
        tools: brief.requiredTools,
        contentTypes: brief.contentType ? [brief.contentType] : [],
        commercialUse: brief.commercialUse,
      };
    }
  }

  const creators = await prisma.creatorProfile.findMany({
    include: {
      user: { select: { id: true, name: true } },
      portfolio: true,
      verification: true,
    },
  });

  const results = creators
    .map((c) => ({ creator: c, match: computeMatchScore(c, query) }))
    .sort((a, b) => b.match.total - a.match.total);

  res.json({ results, query });
}

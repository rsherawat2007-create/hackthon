import { prisma } from "../utils/prisma.js";
import { computeTrustSignals } from "../matching/score.js";

export async function refreshCreatorTrust(creatorId: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    include: { portfolio: true },
  });
  if (!creator) return null;

  const completePortfolioCount = creator.portfolio.filter(
    (p) => p.mediaUrl && p.thumbnailUrl && p.description.length > 20 && p.toolsUsed.length > 0
  ).length;

  const signals = computeTrustSignals({
    bio: creator.bio,
    location: creator.location,
    experience: creator.experience,
    avatarUrl: creator.avatarUrl,
    specializations: creator.specializations,
    skills: creator.skills,
    tools: creator.tools,
    aiModels: creator.aiModels,
    workflow: creator.workflow,
    commercialUse: creator.commercialUse,
    commercialNotes: creator.commercialNotes,
    portfolioCount: creator.portfolio.length,
    completePortfolioCount,
  });

  await prisma.creatorProfile.update({
    where: { id: creatorId },
    data: { trustScore: signals.score },
  });

  await prisma.verification.upsert({
    where: { creatorId },
    update: {
      toolsVerified: signals.toolsVerified,
      portfolioAdded: signals.portfolioAdded,
      workflowDocumented: signals.workflowDocumented,
      previousWork: signals.previousWork,
      commercialUseInfo: signals.commercialUseInfo,
      score: signals.score,
    },
    create: {
      creatorId,
      toolsVerified: signals.toolsVerified,
      portfolioAdded: signals.portfolioAdded,
      workflowDocumented: signals.workflowDocumented,
      previousWork: signals.previousWork,
      commercialUseInfo: signals.commercialUseInfo,
      score: signals.score,
    },
  });

  return signals;
}

export function publicCreatorSelect() {
  return {
    id: true,
    headline: true,
    bio: true,
    location: true,
    avatarUrl: true,
    experience: true,
    experienceYears: true,
    commercialUse: true,
    commercialNotes: true,
    workflow: true,
    trustScore: true,
    skills: true,
    specializations: true,
    tools: true,
    aiModels: true,
    contentTypes: true,
    user: { select: { id: true, name: true, email: true, role: true } },
    portfolio: { orderBy: { date: "desc" as const } },
    verification: true,
  };
}

export type MatchQuery = {
  keyword?: string;
  skills?: string[];
  specializations?: string[];
  tools?: string[];
  contentTypes?: string[];
  commercialUse?: boolean | null;
  experienceYearsMin?: number | null;
};

export type MatchBreakdown = {
  skill: number;
  specialization: number;
  tool: number;
  contentType: number;
  portfolio: number;
  verification: number;
  total: number;
  label: "Excellent Match" | "Strong Match" | "Good Match" | "Partial Match";
};

export type MatchableCreator = {
  skills: string[];
  specializations: string[];
  tools: string[];
  aiModels: string[];
  contentTypes: string[];
  commercialUse: boolean;
  experienceYears: number;
  bio: string;
  headline: string;
  workflow: string;
  trustScore: number;
  portfolio: Array<{
    title: string;
    description: string;
    contentType: string;
    toolsUsed: string[];
    skills: string[];
    category: string;
  }>;
};

const WEIGHTS = {
  skill: 35,
  specialization: 20,
  tool: 15,
  contentType: 15,
  portfolio: 10,
  verification: 5,
} as const;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function tokenize(keyword?: string) {
  if (!keyword) return [];
  return keyword
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter(
      (t) =>
        t.length > 2 &&
        !["the", "and", "for", "with", "need", "our", "new", "you"].includes(t)
    );
}

function overlapRatio(have: string[], want: string[]) {
  if (!want.length) return 0;
  if (!have.length) return 0;
  const haveSet = have.map(normalize);
  let hits = 0;
  for (const w of want) {
    const n = normalize(w);
    if (haveSet.some((h) => h === n || h.includes(n) || n.includes(h))) hits += 1;
  }
  return hits / want.length;
}

function textHaystack(creator: MatchableCreator) {
  const parts = [
    creator.headline,
    creator.bio,
    creator.workflow,
    ...creator.skills,
    ...creator.specializations,
    ...creator.tools,
    ...creator.aiModels,
    ...creator.contentTypes,
    ...creator.portfolio.flatMap((p) => [p.title, p.description, p.category, p.contentType, ...p.skills, ...p.toolsUsed]),
  ];
  return parts.join(" ").toLowerCase();
}

function keywordCoverage(haystack: string, tokens: string[]) {
  if (!tokens.length) return 0;
  const hits = tokens.filter((t) => haystack.includes(t)).length;
  return hits / tokens.length;
}

export function matchLabel(total: number): MatchBreakdown["label"] {
  if (total >= 90) return "Excellent Match";
  if (total >= 75) return "Strong Match";
  if (total >= 60) return "Good Match";
  return "Partial Match";
}

export function computeMatchScore(creator: MatchableCreator, query: MatchQuery): MatchBreakdown {
  const tokens = tokenize(query.keyword);
  const inferredSkills = [...(query.skills || [])];
  const inferredSpecs = [...(query.specializations || [])];
  const inferredTools = [...(query.tools || [])];
  const inferredTypes = [...(query.contentTypes || [])];

  if (tokens.includes("video") && !inferredTypes.length) inferredTypes.push("AI Video", "Video");
  if (tokens.includes("image") && !inferredTypes.length) inferredTypes.push("AI Image Generation", "Image");
  if ((tokens.includes("product") || tokens.includes("advertisement")) && !inferredSpecs.length) {
    inferredSpecs.push("Product Advertisement");
  }
  if (tokens.includes("runway") && !inferredTools.includes("Runway")) inferredTools.push("Runway");
  if (tokens.includes("cinematic") && !inferredTools.includes("Sora")) {
    inferredTools.push("Sora");
  }
  const productVideo =
    inferredTypes.some((t) => /video/i.test(t)) ||
    tokens.includes("video") ||
    inferredSpecs.some((s) => /product/i.test(s));
  if (productVideo) {
    for (const skill of ["AI Video Direction", "Product Cinematography", "Color Grading"]) {
      if (!inferredSkills.includes(skill)) inferredSkills.push(skill);
    }
  } else if (!inferredSkills.length && (tokens.includes("image") || inferredTypes.some((t) => /image/i.test(t)))) {
    inferredSkills.push("Generative Imaging", "Art Direction", "Retouching");
  }

  let skillRatio = overlapRatio(creator.skills, inferredSkills);
  if (skillRatio < 0.5) {
    const related = creator.skills.filter((s) => /video|cinematography|motion|ugc|short-form|editing/i.test(s)).length;
    skillRatio = Math.max(skillRatio, Math.min(0.45, related * 0.12));
  }
  const specRatio = inferredSpecs.length ? overlapRatio(creator.specializations, inferredSpecs) : keywordCoverage(creator.specializations.join(" ").toLowerCase(), tokens);
  const toolRatio = inferredTools.length ? overlapRatio([...creator.tools, ...creator.aiModels], inferredTools) : keywordCoverage(creator.tools.join(" ").toLowerCase(), tokens);
  const typeRatio = inferredTypes.length ? overlapRatio(creator.contentTypes, inferredTypes) : keywordCoverage(creator.contentTypes.join(" ").toLowerCase(), tokens);

  const haystack = textHaystack(creator);
  const keywordRatio = keywordCoverage(haystack, tokens);
  const portfolioTypeRatio = creator.portfolio.length
    ? overlapRatio(
        creator.portfolio.flatMap((p) => [p.contentType, p.category, ...p.skills, ...p.toolsUsed]),
        [...inferredTypes, ...inferredTools, ...inferredSkills]
      )
    : 0;
  const portfolioRatio = Math.min(1, keywordRatio * 0.6 + portfolioTypeRatio * 0.4 + (creator.portfolio.length >= 2 ? 0.15 : 0));

  const verificationRatio = Math.min(1, creator.trustScore / 100);

  let skill = Math.round(skillRatio * WEIGHTS.skill);
  let specialization = Math.round(specRatio * WEIGHTS.specialization);
  let tool = Math.round(toolRatio * WEIGHTS.tool);
  let contentType = Math.round(typeRatio * WEIGHTS.contentType);
  let portfolio = Math.round(Math.min(1, portfolioRatio) * WEIGHTS.portfolio);
  let verification = Math.round(verificationRatio * WEIGHTS.verification);

  if (query.commercialUse === true && !creator.commercialUse) {
    skill = Math.round(skill * 0.7);
    specialization = Math.round(specialization * 0.7);
  }
  if (query.experienceYearsMin && creator.experienceYears < query.experienceYearsMin) {
    verification = Math.max(0, verification - 2);
  }

  const total = Math.max(0, Math.min(100, skill + specialization + tool + contentType + portfolio + verification));

  return {
    skill,
    specialization,
    tool,
    contentType,
    portfolio,
    verification,
    total,
    label: matchLabel(total),
  };
}

export function computeTrustSignals(input: {
  bio: string;
  location: string;
  experience: string;
  avatarUrl: string;
  specializations: string[];
  skills: string[];
  tools: string[];
  aiModels: string[];
  workflow: string;
  commercialUse: boolean;
  commercialNotes: string;
  portfolioCount: number;
  completePortfolioCount: number;
}) {
  let profile = 0;
  if (input.bio.length > 40) profile += 8;
  if (input.location) profile += 5;
  if (input.experience) profile += 5;
  if (input.avatarUrl) profile += 5;
  if (input.specializations.length) profile += 4;
  if (input.skills.length >= 3) profile += 3;
  profile = Math.min(30, profile);

  let portfolio = 0;
  if (input.portfolioCount >= 1) portfolio += 12;
  if (input.portfolioCount >= 2) portfolio += 8;
  if (input.portfolioCount >= 3) portfolio += 5;
  if (input.completePortfolioCount >= 2) portfolio += 5;
  portfolio = Math.min(30, portfolio);

  let tools = 0;
  if (input.tools.length >= 1) tools += 8;
  if (input.tools.length >= 3) tools += 6;
  if (input.aiModels.length >= 1) tools += 6;
  tools = Math.min(20, tools);

  const workflow = input.workflow.length > 40 ? 10 : input.workflow.length > 10 ? 6 : 0;
  const commercial = input.commercialNotes.length > 10 || input.commercialUse ? 10 : 0;

  const score = Math.min(100, profile + portfolio + tools + workflow + commercial);

  return {
    score,
    toolsVerified: input.tools.length >= 2,
    portfolioAdded: input.portfolioCount >= 1,
    workflowDocumented: input.workflow.length > 40,
    previousWork: input.portfolioCount >= 2,
    commercialUseInfo: input.commercialNotes.length > 10 || true,
    breakdown: { profile, portfolio, tools, workflow, commercial },
  };
}

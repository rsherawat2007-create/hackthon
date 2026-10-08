export type Role = "CREATOR" | "BRAND";
export type EngagementStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED";

export type MatchBreakdown = {
  skill: number;
  specialization: number;
  tool: number;
  contentType: number;
  portfolio: number;
  verification: number;
  total: number;
  label: string;
};

export type Verification = {
  toolsVerified: boolean;
  portfolioAdded: boolean;
  workflowDocumented: boolean;
  previousWork: boolean;
  commercialUseInfo: boolean;
  score: number;
};

export type PortfolioItem = {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  contentType: string;
  toolsUsed: string[];
  aiModelsUsed: string[];
  skills: string[];
  aspectRatio: string;
  commercialUse: boolean;
  date: string;
  category: string;
  workflow: string;
};

export type Creator = {
  id: string;
  headline: string;
  bio: string;
  location: string;
  avatarUrl: string;
  experience: string;
  experienceYears: number;
  commercialUse: boolean;
  commercialNotes: string;
  workflow: string;
  trustScore: number;
  skills: string[];
  specializations: string[];
  tools: string[];
  aiModels: string[];
  contentTypes: string[];
  user: { id: string; name: string; email?: string };
  portfolio: PortfolioItem[];
  verification?: Verification | null;
  match?: MatchBreakdown;
};

export type Brief = {
  id: string;
  brandId: string;
  title: string;
  description: string;
  contentType: string;
  style: string;
  targetAudience: string;
  platform: string;
  aspectRatio: string;
  duration: string;
  requiredTools: string[];
  requiredSkills: string[];
  commercialUse: boolean;
  deadline: string | null;
  budget: string;
  deliverables: string[];
  creativeDirection: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  creatorProfile?: Creator | null;
  brandProfile?: {
    id: string;
    companyName: string;
    industry: string;
    website: string;
    about: string;
  } | null;
};

export type Engagement = {
  id: string;
  status: EngagementStatus;
  message: string;
  createdAt: string;
  brief: Brief;
  brand: { companyName: string; user: { name: string } };
  creator: Creator & { user: { name: string } };
};

export const TOOLS = ["Midjourney", "Runway", "ChatGPT", "DALL-E", "Stable Diffusion", "Adobe Firefly", "Sora", "ComfyUI", "Kling"];
export const SPECIALIZATIONS = [
  "AI Video",
  "AI Image Generation",
  "Product Advertisement",
  "Social Media Content",
  "Animation",
  "Motion Graphics",
  "AI Branding",
  "Marketing Content",
];
export const CONTENT_TYPES = ["AI Video", "Video", "AI Image Generation", "Image", "Motion Graphics", "Animation", "Social"];
export const SKILLS = [
  "AI Video Direction",
  "Product Cinematography",
  "Motion Design",
  "Color Grading",
  "Generative Imaging",
  "Art Direction",
  "Prompt Engineering",
];

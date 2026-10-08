import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import * as auth from "../controllers/authController.js";
import * as creators from "../controllers/creatorController.js";
import * as portfolio from "../controllers/portfolioController.js";
import * as briefs from "../controllers/briefController.js";
import * as shortlist from "../controllers/shortlistController.js";
import * as engagements from "../controllers/engagementController.js";
import * as dashboard from "../controllers/dashboardController.js";

export const router = Router();

router.post("/auth/register", asyncHandler(auth.register));
router.post("/auth/login", asyncHandler(auth.login));
router.get("/auth/me", requireAuth, asyncHandler(auth.me));

router.get("/creators/search", optionalAuth, asyncHandler(creators.listCreators));
router.get("/creators", optionalAuth, asyncHandler(creators.listCreators));
router.get("/creators/:id", optionalAuth, asyncHandler(creators.getCreator));
router.post("/creators/profile", requireAuth, requireRole("CREATOR"), asyncHandler(creators.upsertMyProfile));
router.put("/creators/profile", requireAuth, requireRole("CREATOR"), asyncHandler(creators.upsertMyProfile));
router.post("/matching", optionalAuth, asyncHandler(creators.matchCreators));

router.get("/portfolio/item/:id", asyncHandler(portfolio.getPortfolioItem));
router.get("/portfolio/:creatorId", asyncHandler(portfolio.listPortfolio));
router.post("/portfolio", requireAuth, requireRole("CREATOR"), asyncHandler(portfolio.createPortfolio));
router.put("/portfolio/:id", requireAuth, requireRole("CREATOR"), asyncHandler(portfolio.updatePortfolio));
router.delete("/portfolio/:id", requireAuth, requireRole("CREATOR"), asyncHandler(portfolio.deletePortfolio));

router.get("/briefs", requireAuth, requireRole("BRAND"), asyncHandler(briefs.listBriefs));
router.post("/briefs", requireAuth, requireRole("BRAND"), asyncHandler(briefs.createBrief));
router.get("/briefs/:id", requireAuth, asyncHandler(briefs.getBrief));
router.put("/briefs/:id", requireAuth, requireRole("BRAND"), asyncHandler(briefs.updateBrief));
router.post("/ai/generate-brief", requireAuth, asyncHandler(briefs.generateBrief));

router.get("/shortlist", requireAuth, requireRole("BRAND"), asyncHandler(shortlist.listShortlist));
router.post("/shortlist", requireAuth, requireRole("BRAND"), asyncHandler(shortlist.addShortlist));
router.delete("/shortlist/:creatorId", requireAuth, requireRole("BRAND"), asyncHandler(shortlist.removeShortlist));

router.get("/engagements", requireAuth, asyncHandler(engagements.listEngagements));
router.post("/engagements", requireAuth, requireRole("BRAND"), asyncHandler(engagements.createEngagement));
router.put("/engagements/:id", requireAuth, asyncHandler(engagements.updateEngagement));

router.get("/dashboard/brand", requireAuth, requireRole("BRAND"), asyncHandler(dashboard.brandDashboard));
router.get("/dashboard/creator", requireAuth, requireRole("CREATOR"), asyncHandler(dashboard.creatorDashboard));

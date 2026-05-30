import { Router, type IRouter } from "express";
import healthRouter        from "./health";
import chatRouter          from "./chat";
import newsRouter          from "./news";
import videosRouter        from "./videos";
import schoolRouter        from "./school";
import leaderboardRouter from "./leaderboard";
import projectsRouter from "./projects";
import commentsRouter from "./comments";
import problemFinderRouter from "./problemfinder";
import thinkingRouter from "./thinking";
import reelsRouter from "./reels";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(newsRouter);
router.use(videosRouter);
router.use(schoolRouter);
router.use(leaderboardRouter);
router.use(projectsRouter);
router.use(commentsRouter);
router.use(problemFinderRouter);
router.use(thinkingRouter);
router.use(reelsRouter);

export default router;

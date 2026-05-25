import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(newsRouter);

export default router;

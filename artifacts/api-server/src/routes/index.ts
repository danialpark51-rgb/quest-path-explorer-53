import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import newsRouter from "./news";
import schoolRouter from "./school";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(newsRouter);
router.use(schoolRouter);

export default router;

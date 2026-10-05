import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analysesRouter from "./analyses";
import demoRouter from "./demo";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analysesRouter);
router.use(demoRouter);
router.use(statsRouter);

export default router;

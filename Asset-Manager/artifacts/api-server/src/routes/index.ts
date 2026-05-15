import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storefrontRouter from "./storefront";
import ordersRouter from "./orders";
import adminAuthRouter from "./admin/auth";
import adminCategoriesRouter from "./admin/categories";
import adminProductsRouter from "./admin/products";
import adminOrdersRouter from "./admin/orders";
import adminStatsRouter from "./admin/stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storefrontRouter);
router.use(ordersRouter);
router.use(adminAuthRouter);
router.use(adminCategoriesRouter);
router.use(adminProductsRouter);
router.use(adminOrdersRouter);
router.use(adminStatsRouter);

export default router;

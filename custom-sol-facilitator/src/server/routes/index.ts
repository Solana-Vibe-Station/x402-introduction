import express, { Router } from "express";
import { paymentRoute } from "../middleware/index.js";
import { controllers } from "../controllers/index.js";

const router: Router = express.Router();

/**
 *  Core Price Routes
 */
router.get("/free", controllers.free);

/**
 *  Premium Routes (require payment)
 */
router.get("/premium", paymentRoute, controllers.premium);

export default router;

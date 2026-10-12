const router = require("express").Router();
const controller = require("./stats.controller");
const auth = require("../../core/middleware/auth");
const checkRole = require("../../core/middleware/role");

router.get("/overview", auth, checkRole("admin"), controller.overview);

router.get("/sales", auth, checkRole("admin"), controller.sales);

router.get("/by-category", auth, checkRole("admin"), controller.byCategory);

router.get("/recent-orders", auth, checkRole("admin"), controller.recentOrders);

module.exports = router;

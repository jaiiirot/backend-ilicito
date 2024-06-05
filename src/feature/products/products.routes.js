import { authorization } from "../../middlewares/authorization.js";
import { authentication } from "../../middlewares/authencations.js";
import { upload } from "../../utils/upload.js";
import { controllersProducts } from "./products.controller.js";
import express from "express";
const router = express.Router();

router.post(
	"/",
	authentication,
	authorization(["ADMIN"]),
	upload.array("photo", 4),
	controllersProducts.postProduct
);
router.delete(
	"/:pid",
	authentication,
	authorization(["ADMIN"]),
	controllersProducts.deleteProduct
);

router.put(
	"/:pid",
	authentication,
	authorization(["ADMIN"]),
	upload.array("photos", 4),
	controllersProducts.putProduct
);

export default router;

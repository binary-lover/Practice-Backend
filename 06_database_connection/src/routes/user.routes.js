import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/lorem").get((req, res) => {

    res.status(200).json({
        message: "Lorem ipsum"
    })
} )

export default router;
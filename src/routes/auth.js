import { Router } from "express";
import AuthController from '../controllers/auth.js';
import { requireAuthenticated } from "../middlewares/authorization.js";

const router = Router();

// public
router.get("/register", AuthController.registerView);
router.post("/register", AuthController.registerUser);

router.get("/register/success", AuthController.registrationSuccessView); 

router.get("/login", AuthController.loginView);
router.post("/login", AuthController.loginUser);

router.get("/login/failed", AuthController.loginFailedView);

router.get("/github", AuthController.githubAuth);
router.get("/github/callback", AuthController.githubAuthCallback);

router.get("/google", AuthController.googleAuth);
router.get("/google/callback", AuthController.googleAuthCallback);

router.get("/password/restore", AuthController.restorePasswordView);
router.post("/password/restore", AuthController.sendEmailToRestorePassword);
router.get("/password/restore/confirm/:token", AuthController.createNewPasswordView);
router.post("/password/reset/:token", AuthController.restorePassword);

// user, premium or ardmin
router.get("/logout", requireAuthenticated, AuthController.logout);


export { router };

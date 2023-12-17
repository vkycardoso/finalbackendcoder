import { Router } from "express";
import UsersController from '../controllers/users.js';
import { requireUserOrPremium, requireAdmin, requireAuthenticated } from "../middlewares/authorization.js";

const router = Router();
const objIdFormat = "[0-9a-fA-F]{24}";

// user, premium and admin
router.get("/current", requireAuthenticated, UsersController.currentUser);
router.post("/profile-img/upload/", requireAuthenticated, UsersController.uploadProfileImage);

// users, premium
router.post(`/:userId(${objIdFormat})/documents`,requireUserOrPremium, UsersController.uploadDocuments);

// admin
router.post(`/role/change/:userId(${objIdFormat})`, requireAdmin, UsersController.changeUserRole); 
router.delete(`/:userId(${objIdFormat})`, requireAdmin, UsersController.deleteUser); 
router.delete('/', requireAdmin, UsersController.deleteInactiveUsers);


export {router};
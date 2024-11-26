import express from "express"
import {deleteUser, Logout, updateUser, userDetails, userlogin, userRegister } from "../controller/user.controller.js";
import { authMiddleware } from "../../Middleware/authMiddleware.js";


const UserRouter  = express.Router()

UserRouter.post("/userregister",userRegister);
UserRouter.post("/userlogin",userlogin);
UserRouter.post("/userLogout",authMiddleware,Logout)
UserRouter.put("/userupdate/:id",authMiddleware,updateUser);
UserRouter.post("/userdelete/:id",authMiddleware,deleteUser)
UserRouter.get("/userDetails/:id",authMiddleware,userDetails)

export default UserRouter;
import express from "express"
import {deleteUser, updateUser, userlogin, userRegister } from "../controller/user.controller.js";


const UserRouter  = express.Router()

UserRouter.post("/userregister",userRegister);
UserRouter.post("/userlogin",userlogin);
UserRouter.post("/userupdate/:id",updateUser);
UserRouter.post("/userdelete/:id",deleteUser)


export default UserRouter;
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import userService from "../service/user.service.js";


const userRegister = asyncHandler(async(req,res,next)=>{
    try {
        const { name, email, password, account_type} = req.body;
        const data = { name, email, password,account_type};
        if(!name|| !email || !password){
            throw new ApiError(400,"all Fields are required")
        }
        const result = await userService.registerUser(data);
        res.status(201).json(new ApiResponse(201,"user is created",result));
    } catch (error) {
        next( new ApiError(400, error.message|| "Error while Register the user", error));
    }
})

const userlogin = asyncHandler(async(req,res,next)=>{
    try {
        const { email, password } = req.body;
        if(!email || !password){
            throw new ApiError(400,"all Fields are required")
        }
        const result = await userService.loginUser(email, password,res);
        res.status(200).json(new ApiResponse(201,"user Login Successful",result));
    } catch (error) {
        next( new ApiError(400, error.message|| "Error while Login the user"));
    }
})

const updateUser = asyncHandler(async(req,res,next)=>{
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const result = await userService.updateUser(id, updatedData);
        res.status(200).json(new ApiResponse(201,"user Update Successful",result));
    } catch (error) {
        console.log(error)
        next( new ApiError(400, error.message|| "Error while Updating the user"));
    }
})

const deleteUser = asyncHandler(async(req,res,next)=>{
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        res.status(200).json(new ApiResponse(201,"user delete Successful",result));
    } catch (error) {
        next( new ApiError(400, error.message|| "Error while Deleting the user",error));
    }
})

export {userRegister,deleteUser,updateUser,userlogin}


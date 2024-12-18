import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import userService from "../service/user.service.js";


const userRegister = asyncHandler(async(req,res,next)=>{
    try {
        const { name, email, password, account_type="User"} = req.body;
        const data = { name, email, password,account_type};
        if(!name|| !email || !password){
            throw new ApiError(400,"all Fields are required","Controller Layer")
        }
        const result = await userService.registerUser(data);
        res.status(201).json(new ApiResponse(201,"user is created",result));
    } catch (error) {
        // console.log("Error Form register api",error)
        next( new ApiError(400, error.errors[0]?.message || error?.message || "Error while Register the user","From Controler layer", error.errors || error));
    }
})

const userlogin = asyncHandler(async(req,res,next)=>{
    try {
        const { email, password } = req.body;
        if(!email || !password){
            throw new ApiError(400,"all Fields are required","Controller Layer")
        }
        const result = await userService.loginUser(email, password,res);
        res.status(200).json(new ApiResponse(201,"user Login Successful",...result));
    } catch (error) {
        //  console.log("Error Form login api",error.message)
        next( new ApiError(400, error.errors[0]?.message || error?.message || "Error while Login the user","From Controler layer", error.errors || error));
    }
})

const userDetails = asyncHandler(async(req,res,next)=>{
    try {
        const { id } = req.params;
        if(!id){
            throw new ApiError(400,"Id Fields are required","Controller Layer")
        }
        const result = await userService.getUserDetails(id);
        res.status(200).json(new ApiResponse(201,"user Details Successful Fetch",result));
    } catch (error) {
        next( new ApiError(400, error.errors[0]?.message || error?.message || "Error while geting the user Details","From Controler layer", error.errors || error));
    }
})

const updateUser = asyncHandler(async(req,res,next)=>{
    try {
        const { id } = req.params;
        const updatedData = req.body;
        // console.log(id,updatedData)
        const result = await userService.updateUser(id, updatedData);
        res.status(200).json(new ApiResponse(201,"user Update Successful",result));
    } catch (error) {
        // console.log(error)
        next( new ApiError(400, error.errors[0]?.message || error?.message || "Error while Updating the user","From Controler layer", error.errors || error));
    }
})

const deleteUser = asyncHandler(async(req,res,next)=>{
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        res.status(200).json(new ApiResponse(201,"user delete Successful",result));
    } catch (error) {
        next( new ApiError(400, error.errors[0]?.message || error?.message || "Error while Deleting the user","From Controler layer", error.errors || error));
    }
})

const Logout = asyncHandler(async(req,res,next)=>{
    try {
     
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json(new ApiResponse(200,"user Logout Successful"));
    } catch (error) {
        next( new ApiError(400, error.errors[0]?.message || error?.message || "Error while Logouting the user","From Controler layer", error.errors || error));
    }
})


export {userRegister,deleteUser,updateUser,userlogin,userDetails,Logout}


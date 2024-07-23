import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) =>{
    // get user data from frontend
    // validate user data
    // check if user exists: email, username
    // check for image, awatar
    // upload them to cloudinary , awtar
    // create user opject - create entry in db
    // send response to frontend without password and refrence tocken
    // check for user creation
    // return response to frontend

    // get user data from frontend
    const { fullName, email, username, password,  } = req.body;

    console.log(req.body);


    // validate user data
    if(fullName === "" || email === "" || username === "" || password === ""){
        throw new ApiError(400, "Please fill all the fields")
    }

    // check if user exists: email, username
    const userExist = await User.findOne({
        $or: [{email}, {username}]
    })
    //
    if(userExist){
        throw new ApiError(400, "User already exists")
    }

    // check for image, awatar
    const avatarLocalPath = req.files?.avatar[0].path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;
    let coverImageLocalPath = null;
    if(req.files && req.files?.coverImage && req.files?.coverImage.length > 0){
        coverImageLocalPath = req.files?.coverImage[0].path
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Please upload images")
    }
    // upload them to cloudinary , awtar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if(!avatar ){
        throw new ApiError(500, "Error uploading images")
    }
    
    // create user opject - create entry in db
    console.log(fullName, email, username, password, avatar.url, coverImage.url);
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // send response to frontend without password and refrence tocken
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Error creating user")
    }

    // return response to frontend
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )

})

export { 
    registerUser,

 }
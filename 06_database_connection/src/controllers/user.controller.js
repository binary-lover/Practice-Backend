import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.revreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
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
    const { fullName, email, username, password } = req.body;

    console.log(req.body);

    // validate user data
    if (fullName === "" || email === "" || username === "" || password === "") {
        throw new ApiError(400, "Please fill all the fields");
    }

    // check if user exists: email, username
    const userExist = await User.findOne({
        $or: [{ email }, { username }],
    });
    //
    if (userExist) {
        throw new ApiError(400, "User already exists");
    }

    // check for image, awatar
    const avatarLocalPath = req.files?.avatar[0].path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;
    let coverImageLocalPath = null;
    if (
        req.files &&
        req.files?.coverImage &&
        req.files?.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files?.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload images");
    }
    // upload them to cloudinary , awtar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Error uploading images");
    }

    // create user opject - create entry in db
    console.log(
        fullName,
        email,
        username,
        password,
        avatar.url,
        coverImage.url
    );
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // send response to frontend without password and refrence tocken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Error creating user");
    }

    // return response to frontend
    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // get user data mainly email and password or username and password from req.body
    // validate user data
    // check if username/email exists
    // check if password is correct
    // generate tokens {access token, refresh token}
    // send cookie to frontend
    // return response to frontend

    // get user data mainly email and password or username and password from req.body
    const { email, username, password } = req.body;

    console.log(username, email, password);
    // eighter username or email is required
    if (!username && !email) {
        // return res.status(400).json({ message: "Please provide email or username" });
        throw new ApiError(400, "Please provide email or username");
    }

    // validate user data
    if (password === "") {
        throw new ApiError(400, "Please provide password");
    }

    // check if username/email exists
    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(404, "user not found..!");
    }

    // check if password is correct
    const isPasswordValid = await user.verifyPassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // generate tokens {access token, refresh token}
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    // removing password and refresh token from user object
    // user.password = undefined;
    // user.refreshToken = undefined;

    const userLoggedIn = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // send cookie to frontend

    const options = {
        httpOnly: true, // cookie cannot be accessed by javascript
        secure: true, // cookie will only be sent over https
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: userLoggedIn,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        { 
            $set: { refreshToken: undefined }
         },
         {
                new: true,
         }
    );
    const options = {
        httpOnly: true, // cookie cannot be accessed by javascript
        secure: true, // cookie will only be sent over https
    };

    return res
        .status(200)
        .clearCookie("accessToken", options) 
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));

});


const refreshAccessTocken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    // verify token
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refreshToken")
        }
        if(incomingRefreshToken!=user?.refreshToken){
            throw new ApiError(401, "refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure : true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200, {accessToken, newRefreshToken}, "Access token refreshed successfully"))
    } catch (error) {
        throw ApiError(401,error?.message|| "Invalid refreshToken")
    }
})

export { registerUser, loginUser, logOutUser, refreshAccessTocken }; 

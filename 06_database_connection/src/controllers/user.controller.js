import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { 
                refreshToken: 1 
            },
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
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }
    // verify token
    try {
        const decodedToken = jwt.verify( //we need to decode because we need to get the user id
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refreshToken");
        }
        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used");
        }
        const options = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, newRefreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw ApiError(401, error?.message || "Invalid refreshToken");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.verifyPassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed sucsessfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200).
    json(new ApiResponse(
        200, 
        req.user, 
        "user got sucsesfully"
    ));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "all fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email,
            },
        },
        { new: true }
    ).select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Details updated sucsessfully"));
});

const updateUserAvatar = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    // delete file from local storage
    try{
        fs.unlinkSync(avatarLocalPath)
    }catch(error){
        throw new ApiError(500, "Error while deleting file from local storage")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated")
    )

})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Avatar File is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    .status(200)
    .json(
        new ApiResponse(200,user,"CoverImage updated")
    )
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is misisng")
    }
    // User.find({username})
    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:_id,
                foreignField:"channel",
                as: "subscribers"
            }
        },{
            $lookup:{
                from: "subscriptions",
                localField:_id,
                foreignField:"subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $condition:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,


            }
        }
    ])
    
    if(channel?.length){
        throw new ApiError(400,"channel does not exist")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched sucsessfully")
    )
})


const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { 
                                $arrayElemAt: ["$owner", 0] 
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"Watch history fetched sucsessfully")
    )
})
 
export {
    registerUser,
    loginUser,  
    logOutUser,
    refreshAccessTocken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};

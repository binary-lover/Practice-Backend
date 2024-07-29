import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video

    // flow:
    // we are togling like for video, coommnet or tweet
    // 1. check if video exists
    // 2. check if user has already liked the video
    // 3. if yes, remove the like
    // 4. if no, add the like
    // 5. return the response
    // Same flow will be followed for comment and tweet

    const { toggleLike, commentId, videoId, tweetId } = req.body;

    let reqLike;

    if (!toggleLike && !commentId && !videoId && !tweetId) {
        throw new ApiError(400, "Invalid request");
    }

    if (toggleLike === "true") reqLike = true;
    else if (toggleLike === "false") reqLike = false;
    else throw new ApiError(400, "Invalid query string!!!");

    let userLike;
    if (commentId) {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        userLike = await Like.findOne({
            comment: commentId,
            likedBy: req.user._id,
        });
    } else if (videoId) {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }
        userLike = await Like.findOne({
            video: videoId,
            likedBy: req.user._id,
        });
    } else if (tweetId) {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }
        userLike = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user._id,
        });
    }

    let isLiked = false;
    let isDisLiked = false;

    if (userLike?.length > 0) {
        // entry is present so toggle status
        if (userLike[0].liked) {
            // like is present
            if (reqLike) {
                // toggle like so delete like
                await Like.findByIdAndDelete(userLike[0]._id);
                isLiked = false;
                isDisLiked = false;
            } else {
                // toggle dis-like so make it dislike
                userLike[0].liked = false;
                let res = await userLike[0].save();
                if (!res) throw new ApiError(500, "error while updating like");
                isLiked = false;
                isDisLiked = true;
            }
        } else {
            // dis-like is present
            if (reqLike) {
                // toggle like so make it like
                userLike[0].liked = true;
                let res = await userLike[0].save();
                if (!res) throw new ApiError(500, "error while updating like");
                isLiked = true;
                isDisLiked = false;
            } else {
                // toggle dis-like so delete dis-like
                await Like.findByIdAndDelete(userLike[0]._id);
                isLiked = false;
                isDisLiked = false;
            }
        }
    } else {
        // entry is not present so create new
        let like;
        if (commentId) {
            like = await Like.create({
                comment: commentId,
                likedBy: req.user?._id,
                liked: reqLike, // true for like and false for dislike
            });
        } else if (videoId) {
            like = await Like.create({
                video: videoId,
                likedBy: req.user?._id,
                liked: reqLike,
            });
        } else if (tweetId) {
            like = await Like.create({
                tweet: tweetId,
                likedBy: req.user?._id,
                liked: reqLike,
            });
        }
        if (!like) throw new ApiError(500, "error while toggling like");
        isLiked = reqLike;
        isDisLiked = !reqLike;
    }

    let totalDisLikes, totalLikes;

    if (commentId) {
        totalLikes = await Like.find({ comment: commentId, liked: true });
        totalDisLikes = await Like.find({ comment: commentId, liked: false });
    } else if (videoId) {
        totalLikes = await Like.find({ video: videoId, liked: true });
        totalDisLikes = await Like.find({ video: videoId, liked: false });
    } else if (tweetId) {
        totalLikes = await Like.find({ tweet: tweetId, liked: true });
        totalDisLikes = await Like.find({ tweet: tweetId, liked: false });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isLiked,
                totalLikes: totalLikes.length,
                isDisLiked,
                totalDisLikes: totalDisLikes.length,
            },
            "Like toggled successfully"
        )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment

    if(!commentId) throw new ApiError(400, "Invalid request");

    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }));

});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    if(!tweetId) throw new ApiError(400, "Invalid request");

    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }));


});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find({ likedBy: req.user?._id, video: { $exists: true } }).populate("video"); //populate: to get the video details from video collection

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));


});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

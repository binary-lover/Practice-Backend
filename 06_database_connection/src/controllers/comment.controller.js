import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    // flow:
    // 1. check if video exists
    // 2. get all comments for the video
        // 2.1. get comments
        // 2.2. get owner details
        // 2.3. get likes count
        // 2.4. check if user liked
        // 2.5. add isLiked field and likes count
        // 2.6. sort comments by createdAt
        // 2.7. project only required fields

    // 3. return

    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    // check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment", // why comment? because we are looking for likes on comments
                as: "likes",
            },
        },
       {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    }; // pagination options

    const comments = await Comment.aggregatePaginate(commentsAggregate, options); // get comments with pagination by aggregating
    
    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));

});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    // check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // check if comment is not empty
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = new Comment({
        content,
        owner: req.user._id,
        video: videoId
    });
    
    if(!comment) {
        throw new ApiError(500, "Could not add comment");
    }

    // save comment
    await comment.save();

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    /// check if comment is not empty
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    // check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // check if user is the owner of the comment
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }
    
    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set:{
                content
            }
        },
        {
            new: true
        }
    );

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));

});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // check if user is the owner of the comment
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };

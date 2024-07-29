import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // flow:
    // 1. get total views
    // 2. get total subscribers
    // 3. get total videos
    // 4. get total likes
    // 5. return
    const { channelId } = req.params;

    const totalViews = await Video.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views",
                },
            },
        },
    ]);

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId,
    });

    const totalVideos = await Video.countDocuments({
        channel: channelId,
    });

    const totalLikes = await Like.countDocuments({
        video: {
            $in: await Video.find({ channel: channelId }).distinct("_id"),
        },
    });

    res.json(
        new ApiResponse({
            totalViews: totalViews[0]?.totalViews || 0,
            totalSubscribers,
            totalVideos,
            totalLikes,
        })
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // flow:
    // 1. get all videos
    // 2. get total views, likes, comments for each video
    // 3. return

    const userId = req.user?._id;
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                createdAt: {
                    $dateToParts: { date: "$createdAt" }
                },
                likesCount: {
                    $size: "$likes"
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
                _id: 1,
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                description: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1
                },
                isPublished: 1,
                likesCount: 1
            }
        }
    ]);
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "channel stats fetched successfully"
        )
    );
});

export { getChannelStats, getChannelVideos };

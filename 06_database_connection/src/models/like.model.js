import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
    },
    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
},{timeseries: true});

export const Like = mongoose.model("Like", likeSchema)
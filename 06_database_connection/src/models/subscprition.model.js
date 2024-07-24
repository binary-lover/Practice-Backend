import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // one who is subscribing 
        ref:User
    },
    channel:{
        type:Schema.Types.ObjectId, // one to whome 'subscriber' is subscribing
        ref: User
    }
},{timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
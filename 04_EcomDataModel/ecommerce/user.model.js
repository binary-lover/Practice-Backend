import mongoos from "mongoos"

const UserSchema = new mongoos.Schema({
    username:{
        
    }
},{timestamps:true})

export const User = mongoos.model("User",UserSchema)
import mongoos from "mongoos"

const UserSchema = new mongoos.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    passwrod:{
        type: String,
        required:[true,"password is required"],
        min:[8,  "pass must be atlease 8 digits"]
    },

},{timestamps:true})

export const User = mongoos.model("User", UserSchema)


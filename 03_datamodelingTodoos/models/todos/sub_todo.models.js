import mongoos from "mongoos"

const subTodoSchema = new mongoos.Schema({
    content:{
        type: String,
        required:true
    },
    complete:{
        type:Boolean,
        default: false
    },
    creaateBy:{
        type:mongoos.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true})

export const subtodo = mongoos.model("subtodo",subTodoSchema)
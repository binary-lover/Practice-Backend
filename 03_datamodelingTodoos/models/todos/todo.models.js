import mongoos from "mongoos"

const todoScema = new mongoos.Schema({
    content:{
        type:String,
        required: true,
    },
    complete:{
        type:Boolean,
        default:false,
    },
    createdBy:{
        type:mongoos.Schema.Types.ObjectId,
        ref:"User"
    },
    subTodos:[
        {
            type:mongoos.Schema.Types.ObjectId,
            ref:"subtodo"
        }
    ]
},{timestamps:true})

export const Todo = mongoos.model("Todo",todoScema)
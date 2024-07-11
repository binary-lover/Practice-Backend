import {asyncHandler} from '../utils/asyncHandler.js'

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) =>
            next(error)
        );
    };
};

export { asyncHandler };

// uisng try catch block to handle the error and send the response
// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message || "Internal Server Error"
//         })
//     }
// }

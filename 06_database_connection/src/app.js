import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';



const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,credentials: true
}))

app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // urlencoded is used to parse the data coming from the form, for example, the data coming from the form is in the form of key-value pairs, so we need to parse it to use it in the application
app.use(express.static("public")); // to serve static files like images, css, js files
app.use(cookieParser()); // to parse the cookies coming from the client like token (token means the user is authenticated or not)
export { app }
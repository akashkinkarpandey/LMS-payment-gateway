import dotenv from "dotenv";
dotenv.config()
// console.log(process.env.PORT);
import morgan from "morgan";
import express from 'express'
import cookieParser from "cookie-parser";
import hpp from "hpp";
import  sanitizer  from "perfect-express-sanitizer";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors"

const app=express()
const PORT=process.env.PORT || 3001

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});
app.use(limiter)
app.use(helmet())
app.use(hpp())
app.use(
  sanitizer.clean({
    xss: true,
    noSql: true,
    sql: true,
  })
);
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://locahost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH','HEAD'],
    allowedHeaders:[
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept"
    ]
}))


if (process.env.NODE_ENV === 'development'){
    app.use(morgan("dev"))
}
app.use(express.json({limit:'10kb'}))
app.use(express.urlencoded({ extended:true,limit:'10kb'}))
app.use(cookieParser())

app.use((err,req,res,next)=>{
    console.log(err.stack)
    res.status(err.status || 500).json(
        {
            status:'error',
            message:err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && {stack:err.stack})
        }
    )
})

app.use((req,res)=>{
    res.status(404).json({
        status:'error',
        message:'route not found'
    })
})
app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV}`);
})
console.log("pandey");

const redis = require("connect-redis").default
const express = require("express")
const users = require("./backend/data/MOCK_DATA.json")
const fs = require("fs")
const { emitWarning } = require("process")
const path = require("path")
const session = require("express-session")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const port = 3000
const KEY = process.env.JWT_SECRET||"supersecret"

const app = express()

app.use(session({
    store : new redis({ client:redisClient }),
    secret:"supersecretkey",
    resave:false,
    saveUninitialized:false,
    cookie:{httpOnly:true , secure: process.env.NODE_ENV==="development"}      //change to production or can also us secure:true
}))

app.use(express.static(path.join(__dirname , "public"))) //one common mistake is not using index.html and the system do not detects.
app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(cookieParser())

app.get("/set-cookie" , (req , res)=>{
    if(req.cookies.mode==1){
        res.cookie("mode" , 0 , {
            httpOnly : true ,                                   //do not lets javascript access the cookies
            sameSite  : "Strict",                               //helps prevent crossSite cookie attacks
            secure: process.env.NODE_ENV ==="development"       //update it to production when shipping
        })
    }
})

app.get("/get-cookie" , (req , res)=>{                          //Have to create this method because we resetricted cookie access
    const cookie = req.cookies.mode
    if(!cookie)return null
    else return res.send(cookie)
})

app.listen(port , ()=>{
    console.log(`The server is listening , PORT: ${port}`)
})
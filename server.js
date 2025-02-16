require("dotenv").config()
const cors = require("cors")
const bcrypt = require("bcryptjs")
const express = require("express")
const users = require("./backend/data/MOCK_DATA.json")
const fs = require("fs")
const path = require("path")
const session = require("express-session")
require("dotenv").config()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const mongo = require("mongoose")
const user = require("./models/database")
const { error } = require("console")
const {mongo_user , mongo_pass , jwtsecret}  = require("./backend/js/confidential.js")
const multer = require("multer")
const compress = require("compression")
const { verify } = require("crypto")
const port = 3000

JWT_SECRET = jwtsecret

const app = express()
const upload =multer()


//Middlewares
app.use(express.static(path.join(__dirname , "public"))) //one common mistake is not using index.html and the system do not detects.
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(cors())
app.use(compress())




//Connections to mongo
const url = `mongodb+srv://${mongo_user}:${mongo_pass}@cluster0.uqm9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
mongo.connect(url,{
    tls:true
})
.then(()=>{
    console.log("Connected to mongoose DB")
})
.catch(error=>console.error("Mongoose not connected . Error : " , error))
const KEY = process.env.JWT_SECRET||"supersecret"

//Registration route
app.post("/register" ,upload.none(), async(req , res)=>{
    try{
        const data = {...req.body , ...req.query}

        console.log("Recieved the user data " , data)

        const{username , password} = data

        const exists = await user.findOne({username}).lean()
        if(exists){
            return res.status(400).json({message:"Username not availaible ."})
        }
        
        const encoded = await bcrypt.hash(password , 10)
        console.log("I reached here.")
        const newUser = new user({username , password:encoded})
        await newUser.save()
       
        res.status(201).json({message : "User registered successfully ."})
    }
    catch(error){
        res.status(500).json({ error : error.message})
    }
})


app.get("/set-cookie" , (req , res)=>{
    if(req.cookies.mode==1){
        res.cookie("mode" , 0 , {
            httpOnly : true ,                                   //do not lets javascript access the cookies
            sameSite  : "Strict",                               //helps prevent crossSite cookie attacks
            secure: process.env.NODE_ENV ==="development"       //update it to production when shipping
        })
    }
})

//login route
app.post("/login" ,upload.none(), async(req , res)=>{
    try{
        const data = {...req.body , ...req.query}
        const {username , password} = data
        console.log("Data : " , data)

        const exists = await user.findOne({username}).lean()

        if(!exists){
            return res.status(400).json({message:"Invalid Credentials."})
        }

        const match = await bcrypt.compare(password , exists.password)
        
        if(!match){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        //generate the jwt token
       
        const token = jwt.sign({userId:exists._id}, JWT_SECRET , {expiresIn :"24h"})

        res.cookie("token" , token , {
            httpOnly:true,
            secure:true,
            sameSite:'Strict',
            maxAge:3600000
        })
        
        return res.status(200).json({message:"Login Successful"})
    }
    catch(error){
        return res.status(500).json({message:`We couldn't verify its you , try again :${ error.message}`})
    }
})


app.get("/get-cookie" , (req , res)=>{                          //Have to create this method because we resetricted cookie access
    const cookie = req.cookies.mode
    if(!cookie)return null
    else return res.send(cookie)
})


//token verification methods
const verifyToken = (req , res , next) =>{

    
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({message:"Access denied. Please login again."})

    try{
        const secretKey = process.env.JWT_SECRET; // Ensure you have `dotenv` configured

        const verified = jwt.verify(token.replace("Bearer ",""),secretKey)
        req.user = verified
        next()
    }
    catch(error){
        return res.status(400).json({message:`Invalid token , Error : ${error}`})
}}

app.use(verifyToken)
//svg methods
app.post("/svg/upload" , (req , res)=>{
    const data = {...req.body , ...req.query};
    console.log("The data is : ", data)

})
app.listen(port , ()=>{
    console.log(`The server is listening , PORT: ${port}`)
})
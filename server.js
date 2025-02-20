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
const {user , SVG}  = require("./models/database")
//const SVG = require("./models/database.js")
const { error } = require("console")
const {mongo_user , mongo_pass , jwtsecret}  = require("./backend/js/confidential.js")
const multer = require("multer")
const compress = require("compression")
const { verify } = require("crypto")
const verifyToken = require("./backend/js/tokenVerify.js")
const port = 3000


JWT_SECRET = jwtsecret  //key is being outsourced 

const app = express()
const upload =multer()  //multer is used to collect form data through post method


//Middlewares
app.use(express.static(path.join(__dirname , "public"))) //one common mistake is not using index.html and the system do not detects.
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(cors())
app.use(compress())




//Connections to mongoDB server
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

//This is currently a dormant method will be further developed
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

//This is a dormant method which will be further developed.
app.get("/get-cookie" , (req , res)=>{                          //Have to create this method because we resetricted cookie access
    const cookie = req.cookies.mode
    if(!cookie)return null
    else return res.send(cookie)
})


app.use(verifyToken)  //confidential custom token verification system.
//svg methods
app.post("/upload-svg" ,upload.none(), async (req , res)=>{
    try{
        const {svgD} = {...req.body , ...req.query};
        console.log("The data is : ", svgD)
        const userId = req.user.userId
        const exists = await user.findOne({_id:userId}).lean()
        console.log("The user is : " , exists)
        const newSVG = new SVG({ userId:exists._id, svgData:svgD})
        console.log("The model being used : " , newSVG.constructor.modelName)
        console.log("I reached here")
        await newSVG.save()
        return res.status(200).json({message:"success"})
    }
    catch(error){
        console.log("The message : " , error)
        return res.status(500).json({message:error})
    }
})


app.listen(port , ()=>{
    console.log(`The server is listening , PORT: ${port}`)
})
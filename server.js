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
const mon = require("mongoose")
const user = require("./models/database")
const { error } = require("console")


const port = 3000

const app = express()


//Middlewares
app.use(express.static(path.join(__dirname , "public"))) //one common mistake is not using index.html and the system do not detects.
app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(cookieParser())
app.use(cors())

const mongo = " "
mon.connect(mongo,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{
    console.log("Connected to mongoose DB")
})
.catch(error=>console.error("Mongoose not connected . Error : " , error))
const KEY = process.env.JWT_SECRET||"supersecret"

//Registration route
app.post("/register" , async(req , res)=>{
    try{
        const{username , password} = req.body

        const exists = await user.findOne({username})

        if(exists){
            return res.status(400).json({message:"Username not availaible ."})
        }

        const encoded = await bycrypt.hash(password , 10)

        const newUser = new user({username , password:encoded})
        await newUser.save()

        res.status(201).json({message : "User registered successfully . "})
    }
    catch(error){
        res.status(500).json({error : error.message})
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
app.post("/login" , async(req , res)=>{
    try{
        const {username , password} = req.body

        const exists = await user.findOne({username})

        if(!user){
            return res.status(400).json({message:"Invalid Credentials."})
        }

        const match = await bcrypt.compare(password , exists.password)

        if(!match){
            return res.status(400).json({message:"Invalid Credentials"})
        }

        //generate the jwt token
        const token = jwt.sign({userId:exists.id}, JWT_SECRET , {expiresIn :"24h"})
        res.json({message:"Login Successful"} , token)
    }
    catch(error){
        return res.status(500).json({message:`We couldn't verify its you , try again :${ error.message()}`})
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
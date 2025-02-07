const express = require("express")
const users = require("./MOCK_DATA.json")
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

app.use(express.static(path.join(__dirname , "public")))
app.use(express.json())
app.use(express.urlencoded({extended : false}))
//app.use(cookieParser())

app.get("",(req ,res)=>{
    //res.redirect(301 ,"/app.html")
 res.sendFile(path.join(__dirname , "public\\app.html"))
})
app.route('/api/users').get((req , res)=>{
    console.log(req.headers)
    res.cookies = {name:"ham"}
    console.log("BASE-URL : ", req.baseUrl , " ,  " , res.cookies)
    // const add = url("./app.html")
    // const html = add.text();
    // res.send(html)
   // res.sendFile(path.join(pathDefault , "app.html"))
    //res.sendFile("./public/app.html")
    return res.json({current:`${__dirname}`})
}).post((req , res)=>{
    const body = req.body
    console.log("body" , body)
    return res.json(body);
})



app.route('/api/users/:id').get((req , res)=>{
    const id = Number(req.params.id)
    const user = users.find((user)=>user.id===id)
    return res.json(user)
}).patch((req , res)=>{
    const id = Number(req.params.id)
    const user = users.find(user=>user.id===id)
    res.json({status:"pending"})
})

app.listen(port , ()=>{
    console.log(`The server is listening , PORT: ${port}`)
})
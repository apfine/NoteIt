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

app.use(express.static(path.join(__dirname , "public"))) //one common mistake is not using index.html and the system do not detects.
app.use(express.json())
app.use(express.urlencoded({extended : false}))
//app.use(cookieParser())


app.route('/api/users').get((req , res)=>{
    const html = add.text();
    res.send(html)
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
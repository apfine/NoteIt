const express = require("express")
const svgRouter = express.Router()
const {user , SVG} = require("../models/database.js")
const verifyToken = require("../backend/js/tokenVerify.js")
const cors = require("cors");
const parser = require("cookie-parser")
const multer = require("multer")
const upload = multer()
svgRouter.use(express.json())
svgRouter.use(express.urlencoded({extended:true}))
svgRouter.use(parser())
svgRouter.use(cors());

svgRouter.use(verifyToken)

svgRouter.post("/upload-svg" ,upload.none(), async (req , res)=>{
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

svgRouter.post("/get-svg" , upload.none() , async(req , res)=>{
  try{
    const {svgId, userId} = {...req.body , ...req.query}

  }
  catch(error){return res.json({message:error})}
})
module.exports = svgRouter
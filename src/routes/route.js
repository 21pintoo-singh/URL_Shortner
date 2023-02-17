const express=require('express')
const router=express.Router()
const UrlController=require('../controller/urlsController')


// test api
router.get("/test",function(req,res){
    res.send("My first api for checking the terminal")
})

router.post('/url/shorten',UrlController.createShortUrl)
router.get('/:urlCode',UrlController.redirectLongUrl)

router.all('/**', (req, res)=>res.status(400).send({status:false,message:"enter path param"}));


module.exports=router;
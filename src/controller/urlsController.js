const UrlModel = require('../models/urlModel')
const shortId = require('shortid')
const Validation = require('../utility/validation')
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  19821,
  "redis-19821.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("LGszmdSk0gshXXTMd2TzmpCm6YepGrYs", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


    const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
    const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const createShortUrl = async function (req, res) {
    try {
        // taking value from request body 
        let data = req.body;
        let { longUrl } = data

        // checking values entered in body or not 
        if (!Validation.emptyObject(data))
            return res.status(400).send({
                status: false,
                msg: 'Please enter the value '
            })

        // to check the entered values 
        if (!Validation.isEmpty(longUrl)) {
            return res.status(400).send({
                status: false,
                msg: 'please enter the correct value'
            })
        }

        // to check the valid url 
        if (!Validation.isValidUrl(longUrl))
            return res.status(400).send({
                status: false,
                msg: 'please enter valid url'
            })
                
                // to check the longurl code in cachememory 
            let checkLongUrl = await GET_ASYNC(`${longUrl}`)
            if(checkLongUrl){
                return res.status(400).send({
                    status: false,
                    message: "link is already shorted",
                    data:JSON.parse(checkLongUrl)
                })
            }
            
            // to check the longUrl in our database 
        const checkUniqueUrl = await UrlModel.findOne({ longUrl: longUrl })
        if (checkUniqueUrl) {
            return res.status(400).send({
                status: false,
                message: "link is already shorted",
                data: checkUniqueUrl
            })
        }

        // creating short url with urlcode
        const fixUrl = "http://localhost:3000/"
        // to generate the shortid
        const urlCode = shortId.generate().toLowerCase()
        const shortUrl = fixUrl + urlCode
        
        // to create the short url code in db 
        let savedData = await UrlModel.create({longUrl:longUrl,shortUrl:shortUrl,urlCode:urlCode})
        // to find the created short url in db 
        let findData=await UrlModel.findOne({longUrl:longUrl}).select({_id:0,__v:0})
        // to set the created shorturl in cache memory
        await SET_ASYNC(`${longUrl}`, JSON.stringify(findData))
    
        // to destructre as we want only these three values
        savedData = {
            longUrl,
            shortUrl,
            urlCode
        }
        // sending response 
        return res.status(201).send({
            status: true,
            data: savedData
        })

    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

const redirectLongUrl = async function (req, res) {

    try {

        let urlCode = req.params.urlCode
        // to check the codeurl is valid or not 
        if (!shortId.isValid(urlCode)) return res.status(400).send({
            status: false,
            msg: 'Please enter the url code between 7-14 character'
        })
       
        // to check the urlcode in cache memory
        let cahcedProfileData = await GET_ASYNC(`${urlCode}`)
        if (cahcedProfileData) {
            res.status(302).redirect(cahcedProfileData)
        } else {
            // to find codeurl in dataBase
            let checkUrlCode = await UrlModel.findOne({urlCode:urlCode} )
            if (!checkUrlCode) return res.status(400).send({
                status: false,
                msg: 'This urlCode is not exist'
            })
            // to set the long url in cache memory
            await SET_ASYNC(`${urlCode}`, checkUrlCode.longUrl)
            let longurl = checkUrlCode.longUrl
            // redirecting to long url
            res.status(302).redirect(longurl)
        }
    } catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message
        })
    }
}


module.exports = { createShortUrl, redirectLongUrl }

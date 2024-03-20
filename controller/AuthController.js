const {db} =  require("../connection")
const webTokenGenerator = require('../middleware/webTokenGenerator');
const webTokenValidator = require('../middleware/webTokenValidator')
const fs = require('fs');
const path = require('path');

module.exports ={
    userlogin: async (req,res)=> {

            const secret_token = await webTokenGenerator({
                "userEmail": req.body.userEmail,
                "userName" : req.body.userName,
                // "userGender" : req.body.userGender,
                "userGender" : "M",
                "accountStatus" : "1"

        })
        return res.status(200).send({
            "Message":"Logged IN",
            "SECRET_TOKEN" : secret_token,
             
        })
    },
    uservalidation: [webTokenValidator ,async (req,res,next)=>{
        console.log(req.body,req.body.userRole,req.body.userEmail)
        if (req.body.userRole === null || req.body.userRole === undefined || req.body.userRole === "" || req.body.userEmail === null || req.body.userEmail === undefined || req.body.userEmail === ""  || req.body.userRole !== '1') {
            return res.status(400).send({ "message": "Access Restricted!" });
        }
        res.status(200).send({"Message":"You are authorised."})
        
    }]
         
}

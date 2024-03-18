const {db} =  require("../connection")
const webTokenGenerator = require('../middleware/webTokenGenerator');
const fs = require('fs');
const path = require('path');

module.exports ={
    userlogin: async (req,res)=> {
            const secret_token = await webTokenGenerator({
                "userEmail": "sajith",
                "userRole": "2",   
        })
        return res.status(200).send({
            "Message":"Logged IN",
            "SECRET_TOKEN" : secret_token,
             
        })
    },
    
         
}

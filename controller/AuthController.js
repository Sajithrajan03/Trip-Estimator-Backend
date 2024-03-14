const jwt = require("jsonwebtoken")
 
module.exports ={
    login: async(req,res)=>{
        const userName= req.body.username
        const user = {
            name:userName
        }
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10m'})
        const refrestToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
        res.json({"AccessToken":accessToken,"RefreshToken":refrestToken})
    },
    authenticateToken: async(req,res,next)=>{
        const authHeader = req.headers['authorization']
        const token =authHeader && authHeader.split(' ')[1]
        if (token ==null) return res.status(401).send({"MESSAGE":"No token sent"})
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
            if (err) return res.sendStatus(403)
            req.user = user
            return res.status(200).send({"User": user})
            next()
        })

    }
}
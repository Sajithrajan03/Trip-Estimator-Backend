const {db} =  require("../initiateConnection")

module.exports={
    test : async(req,res) =>{
        return res.status(200).send({"Message":"ok"})
    },
    registerData : async(req,res)=>{
        return res.status(200).send(req)
    }
}
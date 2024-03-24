const {db} =  require("../connection")
const webTokenGenerator = require('../middleware/webTokenGenerator');
const webTokenValidator = require('../middleware/webTokenValidator')
const fs = require('fs');
const path = require('path');

module.exports ={
    userlogin: async (req,res)=> {

            if (req.body.userEmail == null ||req.body.userEmail==undefined || req.body.userEmail == ""|| req.body.userPass == null||req.body.userPass==undefined || req.body.userPass == "" ){
                    return res.status(400).send({"Message":"Bad Request"})
            }

            let db_connection = await db.promise().getConnection();

            try{
                await db_connection.query(`LOCK TABLES employee_info READ`);
        
                const [employee] = await db_connection.query(
                    `SELECT * from employee_info
                    WHERE emp_email = ? and emp_password = ?;`,
                    [req.body.userEmail, req.body.userPass]
                );
            
                if (employee.length > 0){
                    if (employee[0].emp_status==0){
                        await db_connection.query('UNLOCK TABLES');
                            return res.status(401).send({
                                "Message":"Your Account has been deactivated. "})
                    }
                
                const secret_token = await webTokenGenerator({
                    "userEmail": req.body.userEmail,
                    "userName" : employee[0].emp_name,
                    "userGender" :employee[0].emp_gender,
                    "accountStatus" : employee[0].emp_status

                })
                await db_connection.query('UNLOCK TABLES');
                return res.status(200).send({
                    "Message":"Logged IN",
                    "SECRET_TOKEN" : secret_token,
                    "userEmail": req.body.userEmail,
                    "userName" : employee[0].emp_name,
                    "userGender" :employee[0].emp_gender,
                    "accountStatus" : employee[0].emp_status

                    
                })
                }
                await db_connection.query(`UNLOCK TABLES`);

                return res.status(400).send({ "Message": "Invalid email or password!" });
                }
                catch(err){
                        console.log(err)
                }
                finally {
                    await db_connection.query(`UNLOCK TABLES`);
                    db_connection.release();
                }
                
            
    },
    uservalidation: [webTokenValidator ,async (req,res,next)=>{
         
        if (req.body.userName === null || req.body.userName === undefined || req.body.userName === "" || req.body.userEmail === null || req.body.userEmail === undefined || req.body.userEmail === ""  || req.body.accountStatus === '0') {
            return res.status(400).send({ "Message": "Access Restricted!" });
        }
        res.status(200).send({"Message":"You are authorised."})
        
    }]
         
}

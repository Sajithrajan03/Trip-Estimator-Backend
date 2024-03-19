const {db} =  require("../connection")
const webTokenGenerator = require('../middleware/webTokenGenerator');
const fs = require('fs');
const path = require('path');

module.exports={
    registerUserData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
    
            // Check if the connection is successful
            if (!db_connection) {
                return res.status(500).send({"Message": "Failed to establish database connection"});
            }
            
            let userInfo = req.body;
    
            let insertStatement = `INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status) VALUES `;
            let insertValues = [];
            insertValues.push(`("${userInfo.emp_email}", "${userInfo.emp_password}", "${userInfo.emp_name}", "${userInfo.emp_gender}", "${userInfo.emp_status}")`);
            insertStatement += insertValues.join(', ');
    
            await db_connection.query(`INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status) VALUES ${insertValues.join(', ')}`);
    
            db_connection.release(); 
    
            return res.status(200).send({"Message": "Employee data registered successfully"});
        } catch (error) {
            console.error("Error executing query:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({"Message": "Duplicate entry detected"});
            } else {
                return res.status(500).send({"Message": "Internal server error"});
            }
        }
    },
    getAverages: [webTokenValidator ,async(req,res)=>{
        try{
            let db_connection = await db.promise().getConnection();
    
            // Check if the connectiston is successful
            if (!db_connection) {
                return res.status(500).send({"Message": "Failed to establish database connection"});
            }
            
            if (req.body.authorization_tier == "2");
            
            let insertStatement = `INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status) VALUES `;
            let insertValues = [];
            insertValues.push(`("${userInfo.emp_email}", "${userInfo.emp_password}", "${userInfo.emp_name}", "${userInfo.emp_gender}", "${userInfo.emp_status}")`);
            insertStatement += insertValues.join(', ');
    
            await db_connection.query(`INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status) VALUES ${insertValues.join(', ')}`);
    
            db_connection.release(); 
    
            return res.status(200).send({"Message": "Employee data registered successfully"});
        }
        catch(err){

        }
    }]
    
}
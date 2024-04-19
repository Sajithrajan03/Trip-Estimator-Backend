const mysql = require('mysql2');

const establishConnection = () => {

    const db = mysql.createConnection({
        host: 'localhost',
        user: 'sajith',
        password: 'password', 
        port: "3306",
        database: 'TripEstimator',
        waitForConnections: true,
        multipleStatements: true
    });

    db.connect((err) => {
        if (err) {
            console.log("[ERROR]: Failed to connect to MySQL");
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Connected to MySQL...");
        }
    });
     
    return [db];

}
 

module.exports = establishConnection;
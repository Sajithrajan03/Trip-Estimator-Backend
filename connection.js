const mysql = require("mysql2")

const os = require('os');
const connectionLimit = os.cpus().length;
// console.log(connectionLimit)
const db =  mysql.createPool({
    host: 'localhost',
    user: 'sajith',
    password: 'password', 
    port: "3306",
    database: 'TripEstimator',
    multipleStatements:true,
    waitForConnections: true,
    connectionLimit: connectionLimit,
    queueLimit: 0
  });

module.exports = {db}

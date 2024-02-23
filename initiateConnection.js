const mysql = require("mysql2")

const db =  mysql.createPool({
    host: 'localhost',
    user: 'sajith',
    password: 'password', 
    port: "3306",
    database: 'TripEstimator',
    waitForConnections: true,
  });

module.exports = {db}
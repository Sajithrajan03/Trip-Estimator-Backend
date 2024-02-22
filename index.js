const mysql = require('mysql2/promise');
const express = require('express');

const app = express();

async function fetchData() {
  try {
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'sajith',
      password: 'password', 
      port: "3306",
      database: 'TripEstimator',
    });

    // A simple SELECT query
    const [results, fields] = await connection.query('SELECT * FROM sample;');

    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available

    // Close the connection
    await connection.end();
  } catch (err) {
    console.log(err);
  }
}

// Call the fetchData function
fetchData();

// Respond to GET request with "hi"
app.get('/', (req, res) => {
  res.send('hi');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mysql = require('mysql2/promise');

async function fetchData() {
  try {
    // Create the connection to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
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

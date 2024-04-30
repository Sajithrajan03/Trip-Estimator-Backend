const express = require('express');
const {db} = require('./connection.js');
const jwt = require("jsonwebtoken")
const app = express();
const userWebRouter = require("./routes/userWeb.js")
 
const cors = require('cors');
require('dotenv').config();

// Respond to GET request with "hi"

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5000',
  // Other options as needed
}));
app.use("/api",userWebRouter)



// Start the server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

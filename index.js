 
const express = require('express');
const {db} = require('./connection.js');
const app = express();
const userWebRouter = require("./routes/userWeb.js")
const cors = require('cors');
// Respond to GET request with "hi"
app.use(cors())
app.use(express.json());
app.use("/api",userWebRouter)



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

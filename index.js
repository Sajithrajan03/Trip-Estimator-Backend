 
const express = require('express');
const {db} = require('./connection.js');
const app = express();
const userWebRouter = require("./routes/userWeb.js")
// Respond to GET request with "hi"
app.use(express.json());
app.use("/api",userWebRouter)

app.get("/hi",(req,res)=>{
  console.log(req)
  res.send("this is fun")
})

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mysql = require('mysql2/promise');
const express = require('express');
const {db} = require('./initiateConnection.js');
const app = express();

// Respond to GET request with "hi"
app.get("/test",(req,res)=>{
  res.status(200).send("The server is good")
})
app.get('/',async (req, res) => {
  let db_connection = await db.promise().getConnection();
  try{
  const x = db_connection.query('SELECT * FROM sample;');
  x.then(function(result){
    console.log(result)
    res.send(result)
  })
  }
  catch{}
  finally{
     
     db_connection.release();
  }

});
app.get("/hi",(req,res)=>{
  console.log(req)
  res.send("this is fun")
})

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

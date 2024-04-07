const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({path:"../.env"})
const TEMPLATE_OTP = require("./template_otp.js");
const TEMPLATE_UPDATE_TRIP = require("./template_update_Trip.js")
const TEMPLATE_TRIP_REQUEST_RECEIVED = require("./template_trip_create.js") 

const sendMail = (to, subject, message) =>{
  const transporter = nodemailer.createTransport({
    service : "hotmail",
    auth : {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
    
})

// Setup email data
const options = {
    from : process.env.MAIL_USERNAME, 
    to, 
    subject, 
    text: message,
}

// Send email
transporter.sendMail(options, (error, info) => {
    if (error) {
        console.error('Error occurred:', error);
    } else {
        console.log('Email sent:', info.response);
    }
});
}
const registerOTP = (to,otp,userName) =>{
    

    try{
        cid = "unique@kreata.ee"  
         
    const transporter = nodemailer.createTransport({
      service : "hotmail",
      auth : {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
      }
      
  })
  
  
  // Setup email data
  const options = {
      from : process.env.MAIL_USERNAME, 
      to, 
      subject :"Trip Estimator - OTP verification",
      html : TEMPLATE_OTP(otp, userName),
          attachments: [{
            filename: 'logo_.png',
            path: '/home/azureuser/Trip-Estimator-Backend/utils/logo_.png',
            cid: 'unique@kreata.ee' //same cid value as in the html img src
        }]
  }
  
 
  transporter.sendMail(options, (error, info) => {
      if (error) {
          console.error('Error occurred:', error);
      } else {
          console.log('Email sent:', info.response);
      }
      return;
  });}
  catch(err){
    console.log(err)
  }
  return;
  }
  
const updateTripStatus  = (to,trip_id, travel ,noofdays, trip_status, amount,userName) => {
    try{       
        let cid = "unique@kreata.ee"          
        const htmlTemplate = TEMPLATE_UPDATE_TRIP(trip_id, travel,noofdays, trip_status, amount,userName);
        const transporter = nodemailer.createTransport({
          service : "hotmail",
          auth : {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD
          }
          
      })
      
      
      // Setup email data
      const options = {
          from : process.env.MAIL_USERNAME, 
          to, 
          subject :"Trip Estimator - Trip Status Update",
          html : TEMPLATE_UPDATE_TRIP(trip_id, travel,noofdays, trip_status, amount,userName,cid),
          attachments: [{
            filename: 'logo_.png',
            path: '/home/azureuser/Trip-Estimator-Backend/utils/logo_.png',
            cid: 'unique@kreata.ee' //same cid value as in the html img src
        }]
      }
       
      
      
     
      transporter.sendMail(options, (error, info) => {
          if (error) {
              console.error('Error occurred:', error);
          } else {
              console.log('Email sent:', info.response);
          }
          return;
      });}
      catch(err){
        console.log(err)
      }
      return;
      
 
};
 
const createTrip  = (to, travel ,noofdays, userName) => {
    try{                 
        let cid = "unique@kreata.ee"
        const transporter = nodemailer.createTransport({
          service : "hotmail",
          auth : {
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD
          }
          
      })
      
      
      // Setup email data
      const options = {
          from : process.env.MAIL_USERNAME, 
          to , 
          subject :"Trip Estimator - Trip Request Created",
          html : TEMPLATE_TRIP_REQUEST_RECEIVED(travel ,noofdays, userName,cid),
          attachments: [{
            filename: 'logo_.png',
            path: '/home/azureuser/Trip-Estimator-Backend/utils/logo_.png',
            cid: 'unique@kreata.ee' //same cid value as in the html img src
        }]

      }
      
     
      transporter.sendMail(options, (error, info) => {
          if (error) {
              console.error('Error occurred:', error);
          } else {
              console.log('Email sent:', info.response);
          }
          return;
      });}
      catch(err){
        console.log(err)
      }
      return;
      
 
};

module.exports = {sendMail,registerOTP,updateTripStatus,createTrip};
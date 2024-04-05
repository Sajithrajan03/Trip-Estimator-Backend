const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({path:"../.env"})
const TEMPLATE_OTP = require("./template_otp.js");

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
     
    const htmlTemplate = TEMPLATE_OTP(otp, userName);
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
      html : htmlTemplate
  }
  
 
  transporter.sendMail(options, (error, info) => {
      if (error) {
          console.error('Error occurred:', error);
      } else {
          console.log('Email sent:', info.response);
      }
  });
  }
  
module.exports = {sendMail,registerOTP};
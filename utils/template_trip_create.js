const TEMPLATE_TRIP_REQUEST_RECEIVED = (travel, duration, userName) => {
    const fs = require('fs');
    const logoPath = '/home/azureuser/Trip-Estimator-Backend/utils/logo_.png'; // Provide the correct path to your logo file

    // Read the logo file asynchronously and encode it as base64
    const logo = fs.readFileSync(logoPath, { encoding: 'base64' });

    return `<!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Business Trip Request Received</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            font-weight:bold;
        }
        .container {
            max-width: 600px;
            margin-left: 40px;
            margin-right: auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
            display: block;
            margin: 0 auto;
            margin-bottom: 20px;
            
        }
        h1 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #333;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 10px;
            color: #333;
            font-weight:bold;
        }
        .highlight {
            font-weight: bold;
            color: #007bff;
        }
        .imp{
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 10px;
            color: #333;
            font-weight:bold;
        }
    </style>
    </head>

    <body>
        <div class="container">
            <img src="cid:unique@kreata.ee" alt="Company Logo" class="icon">
             
            <h1>Dear ${userName},</h1>
            <p>Your business trip request from <span class="highlight">${travel}</span> for <span class="highlight">${duration} days</span> has been received.</p>
            <p>Our team will review the estimates and the details provided.</p>
            <p>An approver will assess the request and make a decision shortly.</p>
            <br />
            <p>Regards,</p>
            <p>The Trip Estimator Team</p>
        </div>
    </body>

    </html>`;
};

module.exports = TEMPLATE_TRIP_REQUEST_RECEIVED;

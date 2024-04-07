const fs = require('fs');

const TEMPLATE_UPDATE_TRIP = (trip_id, travel, noofdays, trip_status, amount, userName) => {
    let statusMessage;
    if (trip_status === 1) {
        statusMessage = 'Accepted';
    } else if (trip_status === 2) {
        statusMessage = 'Rejected';
    }  

    const fs = require('fs');
    const logoPath = '/home/azureuser/Trip-Estimator-Backend/utils/logo_.png'; // Provide the correct path to your logo file

    // Read the logo file asynchronously and encode it as base64
    const logo = fs.readFileSync(logoPath, { encoding: 'base64' });

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Trip Estimator - Trip Update</title>
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
                    color: #555;
                    font-weight:bold;
                }
                .highlight {
                    font-weight: bold;
                    color: #007bff;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="cid:unique@kreata.ee" alt="Company Logo" class="logo" />
                <h1>Dear ${userName},</h1>
                <p>We are writing to inform you about the latest update regarding your trip:</p>
                <p><span class="highlight">Trip ID:</span> ${trip_id}</p>
                <p><span class="highlight">Travel Destination:</span> ${travel}</p>
                <p><span class="highlight">Duration of Trip:</span> ${noofdays} days</p>
                <p><span class="highlight">Trip Status:</span> ${statusMessage}</p>
                <p><span class="highlight">Modified Amount:</span>₹ ${amount}</p>
                <br />
                <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
                <br />
                <p>Best Regards,</p>
                <p>The Trip Estimator Team</p>
            </div>
        </body>
        </html>
    `;
};

module.exports = TEMPLATE_UPDATE_TRIP;
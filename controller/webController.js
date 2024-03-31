const { db } = require("../connection")
const webTokenGenerator = require('../middleware/webTokenGenerator');
const webTokenValidator = require('../middleware/webTokenValidator')
const fs = require('fs');
const path = require('path');

module.exports = {
    registerUserData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();

            // Check if the connection is successful
            if (!db_connection) {
                return res.status(500).send({ "Message": "Failed to establish database connection" });
            }

            let userInfo = req.body;

            let insertStatement = `INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status) VALUES `;
            let insertValues = [];
            insertValues.push(`("${userInfo.emp_email}", "${userInfo.emp_password}", "${userInfo.emp_name}", "${userInfo.emp_gender}", "${userInfo.emp_status}")`);
            insertStatement += insertValues.join(', ');

            await db_connection.query(`INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status) VALUES ${insertValues.join(', ')}`);

            db_connection.release();

            return res.status(200).send({ "Message": "Employee data registered successfully" });
        } catch (error) {
            console.error("Error executing query:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({ "Message": "Duplicate entry detected" });
            } else {
                return res.status(500).send({ "Message": "Internal server error" });
            }
        }
    },
    getAverages: [webTokenValidator, async (req, res) => {
        let db_connection;
        try {
            db_connection = await db.promise().getConnection();

            if (!db_connection) {
                return res.status(500).send({ "Message": "Failed to establish database connection" });
            }

            if (req.body.authorization_tier === "0" || req.body.authorization_tier === "2") {
                return res.status(401).send({ "Message": "Unauthorized" });
            }

            const startCityInt = parseInt(req.body.start_city, 10);
            const endCityInt = parseInt(req.body.end_city, 10);

            await db_connection.query(`LOCK TABLES bus_info READ, route_info READ`);

            const busAvg_prices = await db_connection.query(
                `SELECT AVG(bus_price) AS avg_price 
                 FROM bus_info 
                 WHERE bus_route IN (
                     SELECT route_id 
                     FROM route_info 
                     WHERE route_start_city = ? AND route_end_city = ?
                 ) 
                 GROUP BY bus_ac, bus_sleeper 
                 ORDER BY bus_ac, bus_sleeper;`,
                [startCityInt, endCityInt]
            );
            const busAvg_prices2 = await db_connection.query(
                `SELECT AVG(bus_price) AS avg_price 
                 FROM bus_info 
                 WHERE bus_route IN (
                     SELECT route_id 
                     FROM route_info 
                     WHERE route_start_city = ? AND route_end_city = ?
                 ) 
            `,
                [startCityInt, endCityInt]
            );

            const busAvg_arr = busAvg_prices.map(subArray => {
                return subArray.map(item => {

                    return item.avg_price;
                });
            });

            const busAvg = {
                "noac_nosleeper": busAvg_arr[0][0],
                "noac_sleeper": busAvg_arr[0][1],
                "ac_nosleeper": busAvg_arr[0][2],
                "ac_sleeper": busAvg_arr[0][3],
                "busAverage": busAvg_prices2[0][0].avg_price
            }
            await db_connection.query(`UNLOCK TABLES`);

            await db_connection.query(`LOCK TABLES flight_info READ, route_info READ`);

            const flightAvg_prices = await db_connection.query(
                `SELECT AVG(flight_economy_price) AS avg_economy_price,
                        AVG(flight_premium_price) AS avg_premium_price,
                        AVG(flight_business_class_price) AS avg_business_price
                 FROM flight_info 
                 WHERE flight_route IN (
                     SELECT route_id 
                     FROM route_info 
                     WHERE route_start_city = ? AND route_end_city = ?
                 ) 
                 GROUP BY flight_route;`,
                [startCityInt, endCityInt]
            );
            const flightAvg_prices2 = await db_connection.query(
                `SELECT 
                AVG(total_avg_price) AS avg_flight_price
            FROM (
                SELECT 
                    (
                        COALESCE(flight_economy_price, 0) +
                        COALESCE(flight_premium_price, 0) +
                        COALESCE(flight_business_class_price, 0)
                    ) / NULLIF(
                        GREATEST(
                            IF(flight_economy_price IS NOT NULL, 1, 0),
                            IF(flight_premium_price IS NOT NULL, 1, 0),
                            IF(flight_business_class_price IS NOT NULL, 1, 0)
                        ),
                        0
                    ) AS total_avg_price
                FROM 
                    flight_info
                WHERE 
                    flight_route IN (
                        SELECT route_id 
                        FROM route_info 
                        WHERE route_start_city = ? AND route_end_city = ?
                    )
            ) AS avg_prices;
            
                `,
                [startCityInt, endCityInt]
            );
            

            const flightAvg = flightAvg_prices[0].length > 0 ? Object.values((flightAvg_prices[0])[0]) : [null, null, null]

            const [avg_economy_price, avg_premium_price, avg_business_price] = flightAvg;
            
            
            await db_connection.query(`UNLOCK TABLES`);
            await db_connection.query(`LOCK TABLES hotel_info READ`);

            let hotelQuery = `SELECT AVG(hotel_standard_price) AS avg_standard_price,
                                    AVG(hotel_deluxe_price) AS avg_deluxe_price,
                                    AVG(hotel_suite_price) AS avg_suite_price,
                                    hotel_rating
                                 FROM hotel_info 
                             WHERE hotel_city =  ?`;

            if (req.body.hotel_rating) {
                const hotelRating = parseInt(req.body.hotel_rating, 10);
                hotelQuery += ` AND hotel_rating <= ${hotelRating} GROUP BY hotel_rating order by hotel_rating;`;
            }
            const hotelAvg_prices = await db_connection.query(
                hotelQuery,
                [endCityInt]
            );
            
             
            let hotelPrice = {
               "3" : {
                "standard":  null,
                "deluxe": null,
                "suite": null
               } 
            };
        if (hotelAvg_prices[0].length!=0){
        hotelAvg_prices[0].forEach(row => {
            
            const rating = row.hotel_rating;
            hotelPrice[rating] = {
                "standard": row.avg_standard_price || null,
                "deluxe": row.avg_deluxe_price || null,
                "suite": row.avg_suite_price || null
            };
        });}
         

            

            

            await db_connection.query(`UNLOCK TABLES`);
            await db_connection.query(`LOCK TABLES car_travel_info READ, route_info READ`);

            const carAvg_prices = await db_connection.query(
                `SELECT AVG(car_price) AS avg_price 
                 FROM car_travel_info 
                 WHERE car_route IN (
                     SELECT route_id 
                     FROM route_info 
                     WHERE route_start_city = ? AND route_end_city = ?
                 ) 
                 GROUP BY car_route;`,
                [startCityInt, endCityInt]
            );

            const carAvg = carAvg_prices.map(subArray => {
                return subArray.map(item => {
                    return item.avg_price;
                });
            });
            await db_connection.query(`UNLOCK TABLES`);
            await db_connection.query(`LOCK TABLES train_info  READ, route_info READ`);


            const trainAvg_prices = await db_connection.query(
                `SELECT AVG(train_seater_price) AS avg_seater_price,
                        AVG(train_sl_price) AS avg_sl_price,
                        AVG(train_1a_price) AS avg_1a_price,
                        AVG(train_2a_price) AS avg_2a_price,
                        AVG(train_3a_price) AS avg_3a_price,
                        AVG(train_ac_executive_price) AS avg_ac_executive_price,
                        AVG(train_ac_chair_price) AS avg_ac_chair_price
                 FROM train_info 
                 WHERE train_route IN (
                     SELECT route_id 
                     FROM route_info 
                     WHERE route_start_city = ? AND route_end_city = ?
                 ) 
                 GROUP BY train_route;`,
                [startCityInt, endCityInt]
            );
            
            const trainAvg_prices2 = await db_connection.query(
                `SELECT 
                AVG(total_avg_price) AS total_avg_price
            FROM (
                SELECT 
                    (
                        COALESCE(train_seater_price, 0) +
                        COALESCE(train_sl_price, 0) +
                        COALESCE(train_1a_price, 0) +
                        COALESCE(train_2a_price, 0) +
                        COALESCE(train_3a_price, 0) +
                        COALESCE(train_ac_executive_price, 0) +
                        COALESCE(train_ac_chair_price, 0)
                    ) / 7 AS total_avg_price
                FROM 
                    train_info
                WHERE 
                    train_route IN (
                        SELECT route_id 
                        FROM route_info 
                        WHERE route_start_city = ? AND route_end_city = ?
                    )
            ) AS avg_prices;
            
                `,
                [startCityInt, endCityInt]
            );
             
            const trainAvg = trainAvg_prices.map(subArray => {
                return subArray.map(item => {
                    return {
                        seater: item.avg_seater_price,
                        sl: item.avg_sl_price,
                        '1A': item.avg_1a_price,
                        '2A': item.avg_2a_price,
                        '3A': item.avg_3a_price,
                        ac_executive: item.avg_ac_executive_price,
                        ac_chair: item.avg_ac_chair_price,
                        trainAverage : trainAvg_prices2[0][0].total_avg_price
                    };
                });
            });

            await db_connection.query(`UNLOCK TABLES`);

            db_connection.release();
            
            // bus price [0] -- no ac not sleeper
            // bus price [1] -- no ac  sleeper
            // bus price [2] -- ac not sleeper
            // bus price [3] --  ac  sleeper

            return res.status(200).send({
                "Message": [{
                    "busPrice": busAvg,
                    "carPrice": {
                        "carAverage" : carAvg[0][0]
                    },
                    "trainPrice": trainAvg[0][0],
                    "flightPrice": {
                        "economy": avg_economy_price,
                        "premium": avg_premium_price,
                        "business": avg_business_price,
                        "flightAverage" : flightAvg_prices2[0][0].avg_flight_price
                    },
                    "hotelPrice": hotelPrice
                }]
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ "Message": "Internal Server Error" });
        }
        finally{
             
            if (db_connection) {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.release();
            }
        }
    }],

    enterTripDetails: [
        webTokenValidator,
        async (req, res) => {
            try {

                const requiredFields = ["emp_email", "travel_start_date", "travel_end_date", "transport_mode", "transport_estimate", "transport_amount", "hotel_type", "hotel_estimate", "hotel_amount", "food_estimate", "food_amount", "miscellaneous_estimate", "miscellaneous_amount", "total_estimate", "total_amount", "travel_reason", "trip_estimate", "trip_amount"];
                for (const field of requiredFields) {
                    if (!req.body[field]) {
                        return res.status(400).send({ "Message": `${field.replace('_', ' ')} is required` });
                    }
                }

                let db_connection = await db.promise().getConnection();

                if (!db_connection) {
                    return res.status(500).send({ "Message": "Failed to establish database connection" });
                }

                if (req.body.authorization_tier === "0" || req.body.authorization_tier === "2") {
                    return res.status(401).send({ "Message": "Unauthorized" });
                }
                const [employeeRow] = await db_connection.query('SELECT emp_id FROM employee_info WHERE emp_email = ?', [req.body.emp_email]);

                if (employeeRow.length === 0) {
                    return res.status(401).send({ "Message": "Unauthorized" });
                }

                const emp_id = employeeRow[0].emp_id;

                // Insert trip details
                await db_connection.query(`INSERT INTO trip_info (emp_id, start_city, end_city, travel_start_date, travel_end_date, transport_mode, transport_estimate, transport_amount, hotel_type, hotel_estimate, hotel_amount, food_estimate, food_amount, miscellaneous_estimate, miscellaneous_amount, total_estimate, total_amount, travel_reason, trip_status, trip_estimate, trip_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        emp_id, req.body.start_city, req.body.end_city, req.body.travel_start_date, req.body.travel_end_date,
                        req.body.transport_mode, req.body.transport_estimate, req.body.transport_amount, req.body.hotel_type,
                        req.body.hotel_estimate, req.body.hotel_amount, req.body.food_estimate, req.body.food_amount,
                        req.body.miscellaneous_estimate, req.body.miscellaneous_amount, req.body.total_estimate,
                        req.body.total_amount, req.body.travel_reason, 0,
                        req.body.trip_estimate, req.body.trip_amount
                    ]);

                db_connection.release();

                return res.status(200).send({
                    "Message": "Trip details added successfully!"
                });
            } catch (err) {
                console.error(err);
                return res.status(500).send({ "Message": "Internal Server Error" });
            }
        }
    ],
    getDashboardDetails: [
        webTokenValidator,
        async (req, res) => {
            try {
                let db_connection = await db.promise().getConnection();

                if (!db_connection) {
                    return res.status(500).send({ "Message": "Failed to establish database connection" });
                }

                if (req.body.authorization_tier === "0" || req.body.authorization_tier === "2") {
                    return res.status(401).send({ "Message": "Unauthorized" });
                }

                // Retrieve all trip details along with employee names and city names
                const tripDetails = await db_connection.query(`
                    SELECT 
                        trip_info.*, 
                        employee_info.emp_name, 
                        start_city.city_name AS start_city_name, 
                        end_city.city_name AS end_city_name
                    FROM 
                        trip_info
                    JOIN 
                        employee_info ON trip_info.emp_id = employee_info.emp_id
                    JOIN 
                        cities AS start_city ON trip_info.start_city = start_city.city_id
                    JOIN 
                        cities AS end_city ON trip_info.end_city = end_city.city_id
                `);

                db_connection.release();

                return res.status(200).send({
                    "Message": tripDetails[0]
                });
            } catch (err) {
                console.error(err);
                return res.status(500).send({ "Message": "Internal Server Error" });
            }
        }
    ],


    updateTripDetails: [
        webTokenValidator,
        async (req, res) => {
            try {
                const requiredFields = ["trip_id", "trip_status", "trip_amount", "admin_message"];
                for (const field of requiredFields) {
                    if (!req.body[field]) {
                        return res.status(400).send({ "Message": `${field.replace('_', ' ')} is required` });
                    }
                }


                const { trip_id, trip_status, trip_amount, admin_message } = req.body;



                let db_connection = await db.promise().getConnection();

                if (!db_connection) {
                    return res.status(500).send({ "Message": "Failed to establish database connection" });
                }

                if (req.body.accountStatus == "0" || req.body.accountStatus == "1") {
                    return res.status(401).send({ "Message": "Unauthorized" });
                }

                // Check if the trip exists
                const [tripExists] = await db_connection.query('SELECT * FROM trip_info WHERE trip_id = ?', [trip_id]);

                if (tripExists.length === 0) {
                    return res.status(404).send({ "Message": "Trip not found" });
                }

                // Update trip details
                await db_connection.query(`UPDATE trip_info SET trip_status = ?, trip_amount = ?, admin_message = ? WHERE trip_id = ?`,
                    [trip_status, trip_amount, admin_message, trip_id]);

                db_connection.release();

                return res.status(200).send({
                    "Message": "Trip details updated successfully!"
                });
            } catch (err) {
                console.error(err);
                return res.status(500).send({ "Message": "Internal Server Error" });
            }
        }
    ]






}
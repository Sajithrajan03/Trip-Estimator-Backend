const { db } = require("../connection")
const webTokenGenerator = require('../middleware/webTokenGenerator');
const webTokenValidator = require('../middleware/webTokenValidator');
 
const fs = require('fs');
const path = require('path');
const generateOTP = require("../middleware/otpGenerator");
const hotmailer = require('../utils/mailer');
module.exports = {
    registerUserData: async (req, res) => {
        let db_connection
        try {
            db_connection = await db.promise().getConnection();

            // Check if the connection is successful
            if (!db_connection) {
                return res.status(500).send({ "Message": "Failed to establish database connection" });
            }

            let userInfo = req.body;

            let insertStatement = `INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status,city,state,mobile) VALUES `;
            let insertValues = [];
            insertValues.push(`("${userInfo.emp_email}", "${userInfo.emp_password}", "${userInfo.emp_name}", "${userInfo.emp_gender}", "${userInfo.emp_status}","${userInfo.city}","${userInfo.state}","${userInfo.mobile}")`);
            insertStatement += insertValues.join(', ');

            await db_connection.query(`INSERT INTO employee_info (emp_email, emp_password, emp_name, emp_gender, emp_status,city,state,mobile) VALUES ${insertValues.join(', ')}`);

            db_connection.release();

            return res.status(200).send({ "Message": "Employee data registered successfully" });
        } catch (error) {
            console.error("Error executing query:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({ "Message": "Duplicate entry detected" });
            } else {
                return res.status(500).send({ "Message": "Internal server error" });
            }
        }finally{
             
            if (db_connection){
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
            } }
    },

    validateOTP: [webTokenValidator,async(req,res)=>{
        let db_connection = await db.promise().getConnection();
            try {
                await db_connection.query(`LOCK TABLES user_register WRITE,employee_info READ`);
                const [check_1] = await db_connection.query(`Delete from user_register where userEmail = ? and otp = ?`, [req.body.userEmail, req.body.otp]);
                if (check_1.affectedRows === 0) {
                    await db_connection.query(`UNLOCK TABLES`);
                    return res.status(400).send({ "Message": "Invalid OTP!" });
                }

                let [user] = await db_connection.query(`select * from employee_info where emp_email = ?`,[req.body.userEmail])
            await db_connection.query(`UNLOCK TABLES`)
            
            if (user.length >0){
                return res.status(400).send({"Message":"User already found!!"})
            }
                

                 

                return res.status(200).send({
                    "Message": "OTP verifed successfully!",
                });

            } catch (err) {
                console.log(err);
                const time = new Date();
                fs.appendFileSync('logs/errorLogs.txt', `${time.toISOString()} - studentVerify - ${err}\n`);
                return res.status(500).send({ "Message": "Internal Server Error." });
            } finally {
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.release();
            }
    }],
    userEmailRegister: async(req,res)=>{
        let db_connection
        try {
            db_connection = await db.promise().getConnection();

            
            if (!db_connection) {
                return res.status(500).send({ "Message": "Failed to establish database connection" });
            }
            
            await db_connection.query(`LOCK TABLES employee_info READ`);
            let [user] = await db_connection.query(`select * from employee_info where emp_email = ?`,[req.body.userEmail])
            await db_connection.query(`UNLOCK TABLES`)
            
            if (user.length >0){
                return res.status(400).send({"Message":"User already found!!"})
            }

            const otp = generateOTP();
            await db_connection.query(`LOCK TABLES user_register WRITE`);

            let [user_2] = await db_connection.query(`SELECT * from user_register WHERE userEmail = ?`, [req.body.userEmail]);
            console.log(user_2)
            if (user_2.length === 0) {
                await db_connection.query(`INSERT INTO user_register (userEmail, otp,userName) VALUES (?, ?,?)`, [req.body.userEmail, otp,req.body.userName]);
            } else {
                await db_connection.query(`UPDATE user_register SET otp = ?, createdAt = FROM_UNIXTIME(?) WHERE userEmail = ?`, [otp, Date.now(), req.body.userEmail]);
            }
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release()
            hotmailer.registerOTP(req.body.userEmail,otp,req.body.userName );
            const secret_token = await webTokenGenerator({
                "userEmail": req.body.userEmail,
                "userName" : req.body.userName,


            })
            

            return res.status(200).send({ 
                "Message": "OTP sent to email." ,
            "SECRET_TOKEN": secret_token
        });
        } catch (error) {
            console.error("Error executing query:", error);
            
        }
        finally{
             
                if (db_connection){
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.release();
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
                `SELECT bus_ac,bus_sleeper,AVG(bus_price) AS avg_price 
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
            let noac_nosleeper, noac_sleeper, ac_nosleeper, ac_sleeper, busAverage;
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

            busAvg_prices[0].forEach((busAvg) => {
                console.log(busAvg)
                if (busAvg.bus_ac === 0 && busAvg.bus_sleeper === 0) {
                  noac_nosleeper = busAvg.avg_price;
                } else if (busAvg.bus_ac === 0 && busAvg.bus_sleeper === 1) {
                  noac_sleeper = busAvg.avg_price;
                } else if (busAvg.bus_ac === 1 && busAvg.bus_sleeper === 0) {
                  ac_nosleeper = busAvg.avg_price;
                } else if (busAvg.bus_ac == 1 && busAvg.bus_sleeper == 1) {
                  ac_sleeper = busAvg.avg_price;
                }
              });

            
            
            const busAvg = {
                "noac_nosleeper": noac_nosleeper,
                "noac_sleeper": noac_sleeper,
                "ac_nosleeper": ac_nosleeper,
                "ac_sleeper": ac_sleeper,
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
            // const flightAvg_prices2 = await db_connection.query(
            //     `SELECT 
            //     AVG(total_avg_price) AS avg_flight_price
            // FROM (
            //     SELECT 
            //         (
            //             COALESCE(flight_economy_price, 0) +
            //             COALESCE(flight_premium_price, 0) +
            //             COALESCE(flight_business_class_price, 0)
            //         ) / NULLIF(
            //             GREATEST(
            //                 IF(flight_economy_price IS NOT NULL, 1, 0),
            //                 IF(flight_premium_price IS NOT NULL, 1, 0),
            //                 IF(flight_business_class_price IS NOT NULL, 1, 0)
            //             ),
            //             0
            //         ) AS total_avg_price
            //     FROM 
            //         flight_info
            //     WHERE 
            //         flight_route IN (
            //             SELECT route_id 
            //             FROM route_info 
            //             WHERE route_start_city = ? AND route_end_city = ?
            //         )
            // ) AS avg_prices;
            
            //     `,
            //     [startCityInt, endCityInt]
            // );
            
            
            const flightAvg = flightAvg_prices[0].length > 0 ? Object.values((flightAvg_prices[0])[0]) : [null, null, null]
            
            const [avg_economy_price, avg_premium_price, avg_business_price] = flightAvg;
            const flightAvg_prices2 = (parseInt(avg_economy_price) +  parseInt(avg_premium_price) + parseInt(avg_business_price))/3
            
            
            await db_connection.query(`UNLOCK TABLES`);
            await db_connection.query(`LOCK TABLES hotel_info READ`);

            let hotelQuery = `SELECT AVG(hotel_standard_price) AS avg_standard_price,
                                    AVG(hotel_deluxe_price) AS avg_deluxe_price,
                                    AVG(hotel_suite_price) AS avg_suite_price,
                                    hotel_rating
                                 FROM hotel_info 
                             WHERE hotel_city =  ?`;

            if (req.body.hotel_rating) {
                const hotelRating = 5
                hotelQuery += ` AND hotel_rating <= ${hotelRating} GROUP BY hotel_rating order by hotel_rating;`;
            }
            const hotelAvg_prices = await db_connection.query(
                hotelQuery,
                [endCityInt]
            ); 
            let hotelPrice = {
               
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

        await db_connection.query(`LOCK TABLES food_info READ`);

            let foodQuery = `SELECT food_price_veg as vegFoodAverage,
                                    food_price_nonveg as nonVegFoodAverage
                                 FROM food_info 
                             WHERE food_expense_city =  ?`;
            const foodAvg_prices = await db_connection.query(
                foodQuery,
                [endCityInt]
            ); 
            
        await db_connection.query(`UNLOCK TABLES`);
        await db_connection.query(`LOCK TABLES miscellaneous_info READ`);
    
            let miscellaneousQuery = `SELECT miscellaneous_price as miscellaneousAverage
                                 FROM miscellaneous_info 
                             WHERE miscellaneous_expense_city =  ?`;
            const miscellaneousAvg_prices = await db_connection.query(
                miscellaneousQuery,
                [endCityInt]
            ); 
            
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
                        "flightAverage" : flightAvg_prices2
                    },
                    "hotelPrice": hotelPrice,
                    "foodPrice" : foodAvg_prices[0][0],
                    "miscellaneousPrice" : miscellaneousAvg_prices[0][0]
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
            let db_connection
            try {

                const requiredFields = ["emp_email", "travel_start_date", "travel_end_date", "transport_mode", "transport_estimate", "transport_amount", "hotel_type", "hotel_estimate", "hotel_amount", "food_estimate", "food_amount", "miscellaneous_estimate", "miscellaneous_amount", "total_estimate", "total_amount", "travel_reason", "trip_estimate", "trip_amount"];
                for (const field of requiredFields) {
                    if (!req.body[field]) {
                        return res.status(400).send({ "Message": `${field.replace('_', ' ')} is required` });
                    }
                }

                db_connection = await db.promise().getConnection();

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
                await db_connection.query(`INSERT INTO trip_info (emp_id, emp_email,start_city, end_city, travel_start_date, travel_end_date, transport_mode, transport_estimate, transport_amount, hotel_type, hotel_estimate, hotel_amount, food_estimate, food_amount, miscellaneous_estimate, miscellaneous_amount, total_estimate, total_amount, travel_reason, trip_status, trip_estimate, trip_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?)`,
                    [
                        emp_id,req.body.emp_email, req.body.start_city, req.body.end_city, req.body.travel_start_date, req.body.travel_end_date,
                        req.body.transport_mode, req.body.transport_estimate, req.body.transport_amount, req.body.hotel_type,
                        req.body.hotel_estimate, req.body.hotel_amount, req.body.food_estimate, req.body.food_amount,
                        req.body.miscellaneous_estimate, req.body.miscellaneous_amount, req.body.total_estimate,
                        req.body.total_amount, req.body.travel_reason, 0,
                        req.body.trip_estimate, req.body.trip_amount
                    ]);
                    hotmailer.createTrip(req.body.userEmail,req.body.travel,req.body.days,req.body.userName);
                     
                db_connection.release();

                return res.status(200).send({
                    "Message": "Trip details added successfully!"
                });
            } catch (err) {
                console.error(err);
                return res.status(500).send({ "Message": "Internal Server Error" });
            }
            finally{
             
                if (db_connection){
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.release();
                } }
        }
    ],
    getDashboardDetails: [
        webTokenValidator,
        async (req, res) => {
            let db_connection 
            try {
                db_connection = await db.promise().getConnection();

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
            finally{
             
                if (db_connection){
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.release();
                } }
        }
    ],


    updateTripDetails: [
        webTokenValidator,
        async (req, res) => {
            let db_connection
            try {
                const requiredFields = ["trip_id", "trip_status", "trip_amount", "admin_message"];
                for (const field of requiredFields) {
                    if (!req.body[field]) {
                        return res.status(400).send({ "Message": `${field.replace('_', ' ')} is required` });
                    }
                }


                const { trip_id, trip_status, trip_amount, admin_message } = req.body;



                db_connection = await db.promise().getConnection();

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
                await db_connection.query(`UPDATE trip_info SET trip_status = ?, total_amount = ?, admin_message = ? WHERE trip_id = ?`,
                    [trip_status, trip_amount, admin_message, trip_id]);
                
                hotmailer.updateTripStatus(req.body.toemail,trip_id,req.body.travel,req.body.days,trip_status,trip_amount,req.body.empName);
                
                db_connection.release();

                return res.status(200).send({
                    "Message": "Trip details updated successfully!"
                });
            } catch (err) {
                console.error(err);
                return res.status(500).send({ "Message": "Internal Server Error" });
            }
            finally{
             
                if (db_connection){
                await db_connection.query(`UNLOCK TABLES`);
                db_connection.release();
                } }
        }
    ],
    getEmployeeTrips: [
        async (req, res) => {
            let db_connection;
            try {
                db_connection = await db.promise().getConnection();
    
                if (!db_connection) {
                    return res.status(500).send({ "Message": "Failed to establish database connection" });
                }
    
                const { emp_email } = req.body;
    
                // Check if the employee exists
                const [employee] = await db_connection.query(`
                    SELECT emp_id FROM employee_info WHERE emp_email = ?`, [emp_email]);
    
                if (employee.length === 0) {
                    return res.status(404).send({ "Message": "Employee not found" });
                }
    
                // Retrieve trips associated with the employee
                const employeeTrips = await db_connection.query(`
                    SELECT 
                        trip_info.*, 
                        start_city.city_name AS start_city_name, 
                        end_city.city_name AS end_city_name
                    FROM 
                        trip_info
                    JOIN 
                        cities AS start_city ON trip_info.start_city = start_city.city_id
                    JOIN 
                        cities AS end_city ON trip_info.end_city = end_city.city_id
                    WHERE 
                        trip_info.emp_id = ?
                `, [employee[0].emp_id]);
    
                db_connection.release();
    
                return res.status(200).send({
                    "Message": employeeTrips[0]
                });
            } catch (err) {
                console.error(err);
                return res.status(500).send({ "Message": "Internal Server Error" });
            } finally {
                if (db_connection) {
                    await db_connection.query(`UNLOCK TABLES`);
                    db_connection.release();
                }
            }
        }
    ],
    getProfile : async(req,res)=>{
        let db_connection
        try {
            const { emp_email} = req.body;
             db_connection = await db.promise().getConnection();

            if (!db_connection) {
                return res.status(500).send({ "Message": "Failed to establish database connection" });
            }

            // Check if the trip exists
            const [profileExists] = await db_connection.query('SELECT emp_id,emp_email,emp_name,emp_gender,emp_status, city,state,mobile FROM employee_info WHERE emp_email = ?', [emp_email]);

            if (profileExists.length === 0) {
                return res.status(404).send({ "Message": "Employee not found" });
            }

            // Update trip details
             

            db_connection.release();

            return res.status(200).send({
                "Message": profileExists
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send({ "Message": "Internal Server Error" });
        }
        finally{
            
            if (db_connection){
            await db_connection.query(`UNLOCK TABLES`);
            db_connection.release();
            } }
           
        
    }
    






}
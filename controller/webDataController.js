const {db} =  require("../connection")
const webTokenGenerator = require('../middleware/webTokenGenerator');
const fs = require('fs');
const path = require('path');

module.exports={
    test : async(req,res) =>{
        return res.status(200).send({"Message":"ok"})
    },
     
    registerBusData: async (req, res) => {
        let db_connection;
        try {
            db_connection = await db.promise().getConnection();
    
            const busInfo = req.body;
    
            if (!busInfo.busName || !busInfo.busRoute ) {
                return res.status(400).send({"Message": "BusName, route is missing"});
            }
    
            // const busFrom = parseInt(busInfo.busFrom, 10);
            // const busTo = parseInt(busInfo.busTo, 10);
    
            // if (isNaN(busFrom) || isNaN(busTo)) {
            //     return res.status(400).send({"Message": "Invalid busFrom or busTo value"});
            // }
    
            // const [rows] = await db_connection.query('SELECT route_id FROM route_info WHERE route_start_city = ? AND route_end_city = ?', [busFrom, busTo]);
    
            // if (rows.length === 0) {
            //     return res.status(404).send({"Message": "Route not found"});
            // }
    
            // const routeId = rows[0].route_id;
    
            const insertStatement = `INSERT INTO bus_info (bus_name, bus_route, bus_ac, bus_sleeper, bus_price) VALUES (?, ?, ?, ?, ?)`;
    
            await db_connection.query(insertStatement, [busInfo.busName, busInfo.busRoute, busInfo.busAc, busInfo.busSleeper, busInfo.busPrice]);
    
            return res.status(200).send({"Message": "Bus data registered successfully"});
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({"Message": "Duplicate entry detected"});
            } else {
                return res.status(500).send({"Message": error.code});
            }
        } finally {
            if (db_connection) {
                db_connection.release();
            }
        }
    },
    
    registerFlightData: async (req, res) => {
        let db_connection;
        try {
            db_connection = await db.promise().getConnection();
    
            let flightInfo = req.body;
    
            let insertStatement = `INSERT INTO flight_info (flight_name, flight_route, flight_economy_price, flight_premium_price, flight_business_class_price) VALUES `;
            let insertValues = [];
    
            insertValues.push(`("${flightInfo.flightName}", ${flightInfo.flightRoute}, ${flightInfo.flightEconomyPrice}, ${flightInfo.flightPremiumPrice}, ${flightInfo.flightBusinessPrice})`);
            insertStatement += insertValues.join(', ');
    
            const logsFolderPath = path.join( 'logs');
            fs.appendFile(path.join(logsFolderPath, 'Flights_logs.txt'), `${insertStatement};\n`, (err) => {
                if (err) {
                    console.error("Error writing to file:", err);
                }
            });
    
            await db_connection.query(`INSERT INTO flight_info (flight_name, flight_route, flight_economy_price, flight_premium_price, flight_business_class_price) VALUES ${insertValues.join(', ')}`);
    
            return res.status(200).send({"Message": "Flight data registered successfully"});
        } catch (error) {
            console.error("Error executing query:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({"Message": "Duplicate entry detected"});
            } else {
                return res.status(500).send({"Message": "Internal server error"});
            }
        } finally {
            if (db_connection) {
                db_connection.release();
            }
        }
    },
    
    registerHotelData: async (req, res) => {
        let db_connection;
        try {
            db_connection = await db.promise().getConnection();
    
            let hotelInfo = req.body;
    
            let insertStatement = `INSERT INTO hotel_info (hotel_name, hotel_address, hotel_city, hotel_rating, hotel_standard_price, hotel_deluxe_price, hotel_suite_price) VALUES `;
            let insertValues = [];
            insertValues.push(`("${hotelInfo.hotelName}", "${hotelInfo.hotelAddress}", ${hotelInfo.hotelCity}, ${hotelInfo.hotelRating}, ${hotelInfo.hotelStandardPrice}, ${hotelInfo.hotelDeluxePrice}, ${hotelInfo.hotelSuitePrice})`);
            insertStatement += insertValues.join(', ');
    
            const logsFolderPath = path.join('logs');
            fs.appendFile(path.join(logsFolderPath, 'Hotels_logs.txt'), `${insertStatement};\n`, (err) => {
                if (err) {
                    console.error("Error writing to file:", err);
                }
            });
    
            await db_connection.query(`INSERT INTO hotel_info (hotel_name, hotel_address, hotel_city, hotel_rating, hotel_standard_price, hotel_deluxe_price, hotel_suite_price) VALUES ${insertValues.join(', ')}`);
    
            return res.status(200).send({"Message": "Hotel data registered successfully"});
        } catch (error) {
            console.error("Error executing query:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({"Message": "Duplicate entry detected"});
            } else {
                return res.status(500).send({"Message": "Internal server error"});
            }
        } finally {
            if (db_connection) {
                db_connection.release();
            }
        }
    },
    
    
    
    getHotelData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            let data = await db_connection.query('SELECT * FROM hotel_info');
            db_connection.release(); 
     
            const rows = data[0];
            return res.status(200).json({
                message: "Data FETCHED SUCCESSFULLY",
                hotel: rows
            }); 
        } catch (error) {
            console.error("Error retrieving data from the database:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
     
    
    getFlightData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            let data = await db_connection.query('SELECT * FROM flight_info');
            db_connection.release(); 
    
            const rows = data[0];
            return res.status(200).json({
                message: "Data FETCHED SUCCESSFULLY",
                flights: rows
            }); 
        } catch (error) {
            console.error("Error retrieving data from the database:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    registerCityData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            
            let cityInfo = req.body;
    
            let insertStatement = `INSERT INTO cities (city_name) VALUES `;
            let insertValues = [];
    
            insertValues.push(`("${cityInfo.name}")`);
            insertStatement += insertValues.join(', ');
    
            await db_connection.query(`INSERT INTO cities (city_name) VALUES ${insertValues.join(', ')}`);
    
            db_connection.release(); 
            return res.status(200).send({"Message": "City data registered successfully"});
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({"Message": "Duplicate entry detected"});
            } else {
                return res.status(500).send({"Message": "Internal server error"});
            }
        }
    },
    
    registerRouteData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            
            let routeInfo = req.body;
    
            let insertStatement = `INSERT INTO route_info (route_start_city, route_end_city) VALUES `;
            let insertValues = [];
    
            insertValues.push(`(${routeInfo.start_city}, ${routeInfo.end_city})`);
            insertStatement += insertValues.join(', ');
    
            await db_connection.query(`INSERT INTO route_info (route_start_city, route_end_city) VALUES ${insertValues.join(', ')}`);
    
            db_connection.release(); 
            return res.status(200).send({"Message": "Route data registered successfully"});
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({"Message": "Duplicate entry detected"});
            } else {
                return res.status(500).send({"Message": "Internal server error"});
            }
        }
    },
    
     
    
    
    getCityData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            let data = await db_connection.query('SELECT * FROM cities');
            db_connection.release(); 
    
            const rows = data[0];
            return res.status(200).json({
                message: "City data fetched successfully",
                cities: rows
            }); 
        } catch (error) {
            console.error("Error retrieving data from the database:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    
    getRouteData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            let data = await db_connection.query('SELECT * FROM route_info');
            db_connection.release(); 
    
            const rows = data[0];
            return res.status(200).json({
                message: "Route data fetched successfully",
                routes: rows
            }); 
        } catch (error) {
            console.error("Error retrieving data from the database:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    
    getBusData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            let data = await db_connection.query('SELECT * FROM bus_info');
            db_connection.release(); 
    
            const rows = data[0];
            return res.status(200).json({
                message: "Bus data fetched successfully",
                buses: rows
            }); 
        } catch (error) {
            console.error("Error retrieving data from the database:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    registerTrainData: async (req, res) => {
        let db_connection;
        try {
            db_connection = await db.promise().getConnection();
            
            let trainData = req.body;
            let insertValues = [
                `("${trainData.train_name}", ${trainData.train_route}, ${trainData.train_seater_price}, ${trainData.train_sl_price}, ${trainData.train_1a_price}, ${trainData.train_2a_price}, ${trainData.train_3a_price}, ${trainData.train_ac_executive_price}, ${trainData.train_ac_chair_price})`
            ];
            let insertStatement = `INSERT INTO train_info (train_name, train_route, train_seater_price, train_sl_price, train_1a_price, train_2a_price, train_3a_price, train_ac_executive_price, train_ac_chair_price) VALUES ${insertValues.join(', ')}`;
    
            const logsFolderPath = path.join('logs');
            fs.appendFile(path.join(logsFolderPath, 'Train_logs.txt'), `${insertStatement};\n`, (err) => {
                if (err) {
                    console.error("Error writing to file:", err);
                }
            });
    
            await db_connection.query(`INSERT INTO train_info (train_name, train_route, train_seater_price, train_sl_price, train_1a_price, train_2a_price, train_3a_price, train_ac_executive_price, train_ac_chair_price) VALUES ${insertValues.join(', ')}`);
    
            return res.status(200).send({"Message": "Train data registered successfully"});
        } catch (error) {
            console.error("Error executing query:", error);
            return res.status(500).send("Internal Server Error");
        } finally {
            if (db_connection) {
                db_connection.release();
            }
        }
    },
    
    
    registerCarData: async (req, res) => {
        let db_connection;
        try {
            db_connection = await db.promise().getConnection();
    
            let carInfo = req.body;
            let insertValues = [
                `("${carInfo.carName}", ${carInfo.carRoute}, ${carInfo.carPrice})`
            ];
            let insertStatement = `INSERT INTO car_travel_info (car_name, car_route, car_price) VALUES ${insertValues.join(', ')}`;
    
            const logsFolderPath = path.join('logs');
            fs.appendFile(path.join(logsFolderPath, 'Car_logs.txt'), `${insertStatement};\n`, (err) => {
                if (err) {
                    console.error("Error writing to file:", err);
                }
            });
    
            await db_connection.query(`INSERT INTO car_travel_info (car_name, car_route, car_price) VALUES ${insertValues.join(', ')}`);
    
            return res.status(200).send({"Message": "Car data registered successfully"});
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).send({"Message": "Duplicate entry detected"});
            } else {
                return res.status(500).send({"Message": "Internal server error"});
            }
        } finally {
            if (db_connection) {
                db_connection.release();
            }
        }
    },
    
    
    getTrainData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            let data = await db_connection.query('SELECT * FROM train_info');
            db_connection.release(); 
    
            const rows = data[0];
            return res.status(200).json({
                message: "Train data fetched successfully",
                trains: rows
            }); 
        } catch (error) {
            console.error("Error retrieving data from the database:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    
    getCarData: async (req, res) => {
        try {
            let db_connection = await db.promise().getConnection();
            let data = await db_connection.query('SELECT * FROM car_travel_info');
            db_connection.release(); 
    
            const rows = data[0];
            return res.status(200).json({
                message: "Car data fetched successfully",
                cars: rows
            }); 
        } catch (error) {
            console.error("Error retrieving data from the database:", error);
            return res.status(500).send("Internal Server Error");
        }
    }
    
    
    

    
}
CREATE TABLE cities (
    city_id int PRIMARY KEY AUTO_INCREMENT,
    city_name varchar(255) NOT NULL UNIQUE
);

-- Create the "route_info" table
CREATE TABLE route_info (
    route_id int PRIMARY KEY AUTO_INCREMENT,
    route_start_city int NOT NULL,
    route_end_city int NOT NULL,
    CONSTRAINT FK_START_CITY FOREIGN KEY (route_start_city) REFERENCES cities(city_id),
    CONSTRAINT FK_END_CITY FOREIGN KEY (route_end_city) REFERENCES cities(city_id)
);

-- Create the "bus_info" table
CREATE TABLE bus_info(
    bus_id int PRIMARY KEY AUTO_INCREMENT,
    bus_name varchar(255) NOT NULL,
    bus_route int NOT NULL,
    bus_ac int NOT NULL,
    bus_sleeper int NOT NULL,
    bus_price int NOT NULL,
    CONSTRAINT CHK_AC_SLEEPER CHECK (bus_ac IN (0,1) AND bus_sleeper IN (0,1)),
    CONSTRAINT UQ_BUS UNIQUE (bus_name, bus_route),
    CONSTRAINT FK_BUS_ROUTE FOREIGN KEY (bus_route) REFERENCES route_info(route_id)
);

CREATE TABLE hotel_info(
		hotel_id int PRIMARY KEY AUTO_INCREMENT,
		hotel_name varchar(255) NOT NULL,
		hotel_address varchar(255) NOT NULL,
		hotel_city int NOT NULL,
		hotel_rating int NOT NULL,
		hotel_standard_price int NOT NULL,
		hotel_deluxe_price int NOT NULL,
		hotel_suite_price int NOT NULL,
		CONSTRAINT UQ_HOTEL UNIQUE (hotel_name,hotel_address),
		CONSTRAINT CHK_RATING CHECK (hotel_rating BETWEEN 1 AND 5),
		CONSTRAINT FK_HOTEL_CITY FOREIGN KEY (hotel_city) REFERENCES cities(city_id)
);

CREATE TABLE train_info (
    train_id int PRIMARY KEY AUTO_INCREMENT,
    train_name varchar(255) NOT NULL,
    train_route int NOT NULL,
    train_seater_price int,
    train_sl_price int,
    train_1a_price int,
    train_2a_price int,
    train_3a_price int,
    train_ac_executive_price int,
    train_ac_chair_price int,
		CONSTRAINT UQ_TRAIN UNIQUE (train_name ,train_route),
		CONSTRAINT FK_TRAIN_ROUTE FOREIGN KEY (train_route) REFERENCES route_info(route_id)
);

CREATE TABLE car_travel_info (
		car_id int PRIMARY KEY AUTO_INCREMENT,
		car_name varchar(255) NOT NULL,
		car_route int NOT NULL,
		car_price int NOT NULL,
		CONSTRAINT FK_CAR_ROUTE FOREIGN KEY (car_route) REFERENCES route_info(route_id)
);

CREATE TABLE flight_info (
    flight_id int PRIMARY KEY AUTO_INCREMENT,
    flight_name varchar(255) NOT NULL,
    flight_route int NOT NULL,
    flight_economy_price int,
    flight_premium_price int,
    flight_business_class_price int,
		CONSTRAINT UQ_FLIGHT UNIQUE (flight_name ,flight_route),
    CONSTRAINT FK_ROUTE_ID FOREIGN KEY (flight_route) REFERENCES route_info(route_id)
);

CREATE TABLE food_info (
    food_expense_id int PRIMARY KEY AUTO_INCREMENT,
    food_expense_city int NOT NULL,
    food_price_veg, int NOT NULL,
    food_price_nonveg int NOT NULL,
    CONSTRAINT FK_FOOD_CITY FOREIGN KEY (food_expense_city) REFERENCES cities(city_id)
);
CREATE TABLE miscellaneous_info (
    miscellaneous_expense_id int PRIMARY KEY AUTO_INCREMENT,
    miscellaneous_expense_city int NOT NULL,
    miscellaneous_price int NOT NULL,
    CONSTRAINT FK_MISCELLANEOUS_CITY FOREIGN KEY (miscellaneous_expense_city) REFERENCES cities(city_id)
);

INSERT INTO food_info(food_expense_city,food_price_veg,food_price_nonveg) VALUES (1,1000,2000);
INSERT INTO food_info(food_expense_city,food_price_veg,food_price_nonveg) VALUES (2,2000,3000);
INSERT INTO food_info(food_expense_city,food_price_veg,food_price_nonveg) VALUES (3,3000,4000);
INSERT INTO food_info(food_expense_city,food_price_veg,food_price_nonveg) VALUES (4,4000,5000);
INSERT INTO food_info(food_expense_city,food_price_veg,food_price_nonveg) VALUES (5,5000,6000);
INSERT INTO food_info(food_expense_city,food_price_veg,food_price_nonveg) VALUES (6,6000,7000);

INSERT INTO miscellaneous_info(miscellaneous_expense_city,miscellaneous_price) VALUES (1,1000);
INSERT INTO miscellaneous_info(miscellaneous_expense_city,miscellaneous_price) VALUES (2,2000);
INSERT INTO miscellaneous_info(miscellaneous_expense_city,miscellaneous_price) VALUES (3,3000);
INSERT INTO miscellaneous_info(miscellaneous_expense_city,miscellaneous_price) VALUES (4,4000);
INSERT INTO miscellaneous_info(miscellaneous_expense_city,miscellaneous_price) VALUES (5,5000);
INSERT INTO miscellaneous_info(miscellaneous_expense_city,miscellaneous_price) VALUES (6,6000);
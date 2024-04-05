
CREATE TABLE employee_info (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_email varchar(255) NOT NULL UNIQUE,
    emp_password varchar(255) NOT NULL,
    emp_name varchar(255) NOT NULL ,
    emp_gender char(1) NULL,
    emp_status CHAR(1) NOT NULL,
    city varchar(255) NOT NULL,
    state varchar(255) NOT NULL,
    mobile varchar(255) NOT NULL,
    CONSTRAINT CHK_STATUS CHECK (emp_status='0' OR emp_status='1' or emp_status='2' OR emp_status='3')

);

CREATE TABLE user_register(
    id INT PRIMARY KEY AUTO_INCREMENT,
    userEmail VARCHAR(255) NOT NULL UNIQUE,
    userName varchar(255) NOT NULL,
    otp varchar(255) NOT NULL
)

--EMPSTATUS - 
--  0 BANNED
--  1 APPLICANT
--  2 APPROVER
--  3 ADMIN


--transport_mode 
--
CREATE TABLE travel_info(
    travel_id int PRIMARY KEY AUTO_INCREMENT,
    emp_id int NOT NULL,
    start_city int NOT NULL,
    end_city int NOT NULL,
    travel_start_date date NOT NULL,
    travel_end_date date NOT NULL,
    
    CONSTRAINT FK_START_CITY FOREIGN KEY (start_city) REFERENCES cities(city_id),
    CONSTRAINT FK_END_CITY FOREIGN KEY (end_city) REFERENCES cities(city_id),
    CONSTRAINT FK_EMP_ID FOREIGN KEY (emp_id) REFERENCES employee_info(emp_id)

)

CREATE TABLE travel_details_info(
    travel_details_info int PRIMARY KEY AUTO_INCREMENT,
    travel_id int NOT NULL,
    transport_mode int NOT NULL,



    CONTRAINT FK_TRAVEL_ID FOREIGN KEY (travel_id) REFERENCES travel_info(travel_id)
)

CREATE transport_mode (
    id int PRIMARY KEY AUTO_INCREMENT,
    transport_mode_name VARCHAR(255) NOT NULL UNIQUE
)

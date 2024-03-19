
CREATE TABLE employee_info (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_email varchar(255) NOT NULL UNIQUE,
    emp_password varchar(255) NOT NULL,
    emp_name varchar(255) NOT NULL ,
    emp_gender char(1) NULL,
    emp_status CHAR(1) NOT NULL,
    CONSTRAINT CHK_STATUS CHECK (emp_status='0' OR emp_status='1' or emp_status='2')

);

--EMPSTATUS - 
--  0 BANNED
--  1 APPLICANT
--  2 APPROVER
CREATE TABLE applicant_info(
    emp_id,emp_traveldetail,
)

CREATE TABLE approver_info(
    expense_that_emp_needs, avg_we_calculated.
)

CREATE TABLE travel_info(
    travel_id,route_id, 

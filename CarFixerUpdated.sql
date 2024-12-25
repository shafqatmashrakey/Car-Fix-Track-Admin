Create database CarFixerUpdated;

USE CarFixerUpdated;

CREATE TABLE Customers (
    customerId INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(20) NOT NULL,
    lastName VARCHAR(20) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(40),
    address VARCHAR(40));

INSERT INTO Customers (customerId, firstName, lastName, phone, email, address) VALUES
(1, 'John', 'Doe', '1234567890', 'john.doe@gmail.com', '123 Elm Street, Springfield'),
(2, 'Jane', 'Smith','4590689015', 'jane.smith@yahoo.com', '456 Oak Street, Vernon'),
(3, 'Alice', 'Johnson', '3456789012', 'alice.johnson@.comcast.net', '789 Maple Avenue, Manchester'),
(4, 'Bob', 'Brown', '4567890123', 'bob.brown@hotmail.com.com', '101 Pine Road, Middletown'),
(5, 'Eve', 'White', '5678901234', 'eve.white@gmail.com', '202 Cedar Lane, Springfield');


CREATE TABLE Cars (
    licensePlate VARCHAR(30) PRIMARY KEY,
    carMake VARCHAR(30) NOT NULL,
    carModel VARCHAR(30) NOT NULL,
    carYear INT NOT NULL,
    ownerId INT NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES Customers(customerId) 
    ON DELETE CASCADE
);


-- Employees Table
CREATE TABLE Employees (
    employeeId INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(20) NOT NULL,
    lastName VARCHAR(20) NOT NULL,
    email VARCHAR(50),
    workPhone  VARCHAR(15),
    personalPhone  VARCHAR(15),
    totalAppts INT DEFAULT 0
);

INSERT INTO Employees (employeeId, firstName, lastName, email, workPhone, personalPhone, totalAppts) VALUES
(1, 'Emma', 'Johnson', 'emma.johnson@gmail.com', 1234567890, 2345678901, 10),
(2, 'Liam', 'Davis', 'liam.davis@yahoo.com', 3456789012, 4567890123, 15),
(3, 'Sophia', 'Martinez', 'sophia.martinez@gmail.com', 5678901234, 6789012345, 12);


CREATE TABLE Items (
    itemName VARCHAR(30) PRIMARY KEY NOT NULL,
    price FLOAT NOT NULL,
    stock INT DEFAULT 0
);

INSERT INTO Items (itemName, price, stock) VALUES
('Brake Pads', 75.50, 20),
('Oil Filter', 15.75, 50),
('Spark Plug', 8.00, 30),
('Car Battery', 120.00, 20),
('Air Filter', 18.00, 50);


CREATE TABLE Services (
    serviceName VARCHAR(20) PRIMARY KEY,
    serviceDescription VARCHAR(255) 
);

INSERT INTO Services (serviceName, serviceDescription) VALUES
('Oil Change', 'Complete engine oil replacement'),
('Tire Rotation', 'Rotate tires for even wear'),
('Brake Inspection', 'Inspection and maintenance of brake pads and rotors'),
('Battery Check', 'Test and replace car battery if needed'),
('Engine Diagnostic', 'Comprehensive engine performance check');

CREATE TABLE Appointments (
    appointmentId INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    finished BOOLEAN DEFAULT False,
    employeeId INT DEFAULT NULL,
    carId VARCHAR(20),
    issue VARCHAR(25),
    serviceName VARCHAR(20),
	FOREIGN KEY (serviceName) REFERENCES Services(serviceName) ON DELETE SET NULL,
    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId) ON DELETE SET NULL,
    FOREIGN KEY (carId) REFERENCES Cars(licensePlate) ON DELETE SET NULL
);

CREATE TABLE Payments (
    paymentId INT PRIMARY KEY AUTO_INCREMENT,
    customerId INT,
    paidAmount FLOAT DEFAULT 0.00,
    fullyPaid BOOLEAN DEFAULT False,
    duePayment DATE ,
    totalPrice FLOAT DEFAULT 0.0,
    appointmentId INT ,
    FOREIGN KEY (customerId) REFERENCES Customers(customerId) ON DELETE SET NULL,
    FOREIGN KEY (appointmentId) REFERENCES Appointments(appointmentId) ON DELETE CASCADE 
);


-- Bridge Tables for Many-to-Many Relationships


-- Services Offered by Employee Table (Bridge Table between Employees and Services)
CREATE TABLE Employee_Specialties (
    employeeId INT,
    serviceName VARCHAR(20),
    PRIMARY KEY (employeeId, serviceName),
    FOREIGN KEY (employeeId) REFERENCES Employees(employeeId) ON DELETE CASCADE,
    FOREIGN KEY (serviceName) REFERENCES Services(serviceName) ON DELETE CASCADE
);

CREATE TABLE Items_Used(
    itemName VARCHAR(30),
    appointmentId INT,
    PRIMARY KEY (itemName, appointmentId),
    FOREIGN KEY (itemName) REFERENCES Items(itemName) ON DELETE CASCADE,
    FOREIGN KEY (appointmentId) REFERENCES Appointments(appointmentId) ON DELETE CASCADE
);



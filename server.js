const express = require('express');
const path = require('path')
const app = express();
const mysql = require('mysql2');


const port = 3000; // Change port number to something above 1024


require('dotenv').config();


const dbPort = process.env.DB_PORT || 3306; 

const connectionObj = {
  host: 'localhost',
  port:dbPort,
  user: 'caruser',
  password: 'Scsucsc540',
  database: 'CarFixerUpdated',
  connectionLimit:  10  
};
// // Query to get all tables in the database
// pool.query('SELECT * FROM Customers', (err, results) => {
//   if (err) {
//     console.error('Error retrieving tables:', err.message);
//   } else {
//     console.log('Data in Customers Table');
//     console.log(results);
//   }
//   // Close the connection pool
//   // pool.end();
// });

const pool = mysql.createPool(connectionObj);
// Serve static files from the 'public_html' directory
app.use(express.static(path.join(__dirname, 'public_html')));
app.use(express.json());

app.put('/editpayment',(req,res)=>{
  console.log(req.body)
  const {paymentDue,totalCharge, paid,paymentId} = req.body
  fullyPaid = false;
  if (paid>=totalCharge){
    fullyPaid = true
  }

  query = `UPDATE Payments
  SET fullyPaid=${fullyPaid}, duePayment='${paymentDue}',
  totalPrice = ${totalCharge}, paidAmount = ${paid}
  WHERE paymentId=${paymentId}
  `
  pool.query(query, (err, results) => {
    if (err){ 
      console.log(err)
      return res.status(500).json({message:err});
    }

    res.status(200).json({message:'success'});
  });




})
app.get('/getpayments', (req,res) =>{
  query = `SELECT Payments.*, date, CONCAT(firstName,' ',lastName) as customerName
  FROM Payments
  JOIN Appointments USING (appointmentId)
  JOIN Customers USING (customerId)
  `

  pool.query(query, (err, results) => {
    if (err){ 
      return res.status(500).json({message:err});
    }

    res.status(200).json(results);
  });


})

//adding a new payment
app.post('/addnewpayment', (req,res)=>{
  console.log(req.body)

  const {apptId,customerId,paymentDue,charge,paid} = req.body
  fullyPaid = false
  itemsPriceQuery = `
    SELECT SUM(price) as itemPrice
    FROM Appointments JOIN Items_Used USING (appointmentId)
    JOIN Items USING (itemName)
    WHERE appointmentId=${apptId};
  `

  checkItemStockQuery = `SELECT itemName 
  FROM ITEMS 
  WHERE stock = 0
  AND itemName IN (SELECT itemName FROM items_used WHERE appointmentId = ${apptId});` 

  pool.query(checkItemStockQuery, (err,results) => {
    if (err){ 
      console.log(err)
      return res.status(500).json({message:err});
    }
    if (results.length>0){
      const outOfStockItems = results.map(item => item.itemName).join(', ');
      return res.json({message:"out of stock", items: outOfStockItems })

    }
    pool.query(itemsPriceQuery, (err, results) => {
      if (err){ 
        console.log(err)
        return res.status(500).json({message:err});
      }
      itemPrice = results[0].itemPrice
  
      totalPrice = charge+itemPrice
      if(paid>=totalPrice){
        fullyPaid = true;
      }
      insertPaymentQuery =   `
        INSERT INTO  payments (customerId,paidAmount,fullyPaid,duePayment,totalPrice,appointmentId)
        VALUES(${customerId},${paid},${fullyPaid},'${paymentDue}',${totalPrice},${apptId}) 
      `
      pool.query(insertPaymentQuery, (err,results) =>{
        if (err){ 
          console.log(err)
          return res.status(500).json({message:err});
        }
        finishApptQuery = `UPDATE appointments
        SET finished = ${true}
        WHERE appointmentId=${apptId};`
        pool.query(finishApptQuery, (err,results) => {
          if (err){ 
            console.log(err)
            return res.status(500).json({message:err});
          }
          updateStockQuery = `UPDATE ITEMS
          SET stock = stock - 1
          WHERE itemName IN (SELECT itemName FROM items_used WHERE appointmentId=${apptId})
          `
          pool.query(updateStockQuery, (err,results) => {
            if (err){ 
              console.log(err)
              return res.status(500).json({message:err});
            }
            res.status(200).json({message:'success'});}
          
          );
  
  
        })
  
      })
      
  
      // res.status(200).json(results);
    });
  
  })



})

//getting appointments that are not finished
app.get('/getupcomingappts', (req,res)=>{

  query = `SELECT appointments.*, 
        CONCAT(customers.firstname, ' ', customers.lastname) AS customerName, 
        SUM(Items.price) AS itemsCost, customerId
        FROM appointments
        JOIN cars ON appointments.carId = cars.licensePlate
        JOIN customers ON ownerid = customerid
        JOIN Items_Used USING (appointmentId)
        JOIN Items USING (itemName)
        where finished=false
        GROUP BY appointmentId;
  `

  pool.query(query, (err, results) => {
    if (err){ 
      console.log(err)
      return res.status(500).json({message:err});
    }

    res.status(200).json(results);
  });
})

// deleting appointment
app.delete('/deleteappt/:id', (req, res) => {
  console.log(req.params);
  const { id } = req.params;  // The appointmentId parameter will be 'id' based on the URL pattern.

  // Use parameterized query to prevent SQL injection
  const query = 'DELETE FROM Appointments WHERE appointmentId = ?';

  pool.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    };

    updateEmployeeAppts = `UPDATE employees
        SET totalAppts = (
            SELECT COUNT(*)
            FROM appointments
            WHERE appointments.employeeId = employees.employeeId
        )
        WHERE employeeId != 0;`
    pool.query(updateEmployeeAppts,(err,results) =>{
          if(err){
            return res.status(404).json({message: "error "+err})


          }
          res.json({ message: 'success' });



        })
  });
});
// editing appointment
app.put('/editappt', (req, res) => {
  console.log(req.body)
  const { appointmentId, date, time, issue, serviceName,employeeId, carId ,items} = req.body;
  const query = `
  UPDATE appointments 
  SET date = '${date}', time = '${time}', 
      issue = '${issue}',  serviceName = '${serviceName}', 
      employeeId = ${employeeId}, carId =  '${carId}'
  WHERE appointmentId = ${appointmentId};

  
  `;

  console.log(items)

  pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      updateEmployeeAppts = `UPDATE employees
      SET totalAppts = (
          SELECT COUNT(*)
          FROM appointments
          WHERE appointments.employeeId = employees.employeeId
      )
      WHERE employeeId != 0;`

      pool.query(updateEmployeeAppts,(err,results) =>{
        if(err){
          return res.status(404).json({message: "error "+err})


        }
        if (items.length==0){
          return res.json({message:'success'})
        }
        

        pool.query(`delete from items_used where appointmentId=${appointmentId}`,(err,results)=>{
          if (err) {
              console.error('Error deleting data:', err);
              return res.status(500).send(err);
          }
          else{

            const values = items.map(item => [appointmentId, item]);

            const sql = `INSERT INTO Items_Used (appointmentId, ItemName) VALUES ?`;
      
            pool.query(sql, [values], (err, results) => {
              if (err) {
                  console.error('Error inserting data:', err);
                  return;
              }
              return res.json({message:'success'})
      
                  });


            
              }
          });
    



        })
      
      



})

});


// Adding appointment
app.post('/addappt', (req, res) => {
  const { date, time, issue, carId, service, employeeId, items } = req.body;

  let query = `INSERT INTO appointments (date, time, employeeId, carId, issue, serviceName)
               VALUES ('${date}', '${time}', ${employeeId}, '${carId}', '${issue}', '${service}')`;


  pool.query(query, (err, results) => {
      if (err) {
          console.error('Database Error:', err); // Log the error
          res.status(500).send(err); // Send the error to the client
      } else {
          const appointmentId = results.insertId;

          updateEmployeeAppts = `UPDATE employees
          SET totalAppts = (
              SELECT COUNT(*)
              FROM appointments
              WHERE appointments.employeeId = employees.employeeId
          )
          WHERE employeeId != 0;`

          pool.query(updateEmployeeAppts,(err,results) =>{
            if(err){
              return res.status(404).json({message: "error "+err})
    
    
            }

            // Prepare to insert into items_used
            if (items && items.length > 0) {
              const values = items.map(item =>
                  `(${appointmentId}, '${item}')`).join(', ');

              query = `INSERT INTO items_used (appointmentId, itemName) VALUES ${values}`;

              pool.query(query, (err, results) => {
                  if (err) {
                      console.error('Database Error:', err);
                      res.status(500).send(err);
                  } else {
                      res.status(200).json({ message: 'success' });
                  }
              });
          } else {
              res.status(200).json({ message: 'success' });
          }
          
          });


      }
  }); 
});

// getting items used at each appointment
app.get('/getitemsused',(req,res) =>{

  apptId = req.query.apptId

  query = `SELECT *
    FROM items_used
    WHERE appointmentId=${apptId} `

  pool.query(query, (err, results) => {
    if (err) {
        console.error('Database Error:', err); // Log the error
        res.status(500).send(err); // Send the error to the client
    } else {
        res.status(200).json(results);
    }
});

}
)



// getting appointments
app.get('/getappts',(req,res)=>{

  query = `select appointments.*, CONCAT(customers.firstName, ' ', customers.lastName) AS customerName,
CONCAT(carMake, ' ', carModel, ' ', carYear) AS vehicle, 
CONCAT(employees.firstName, ' ',employees.lastName) AS employeeName
from appointments 
JOIN cars on carId=licensePlate 
JOIN customers on ownerId=customerId
JOIN employees USING (employeeId)
;`

  pool.query(query, (err, results) => {
    if (err) {
        console.error('Database Error:', err); // Log the error
        res.status(500).send(err); // Send the error to the client
    } else {
        res.status(200).json(results);
    }
  });



})


// getting employees who offer a certain service
app.get('/getserviceemployees',(req,res) =>{
  service = req.query.service

  query = `SELECT DISTINCT firstName,lastName,employeeId 
    FROM Employee_Specialties 
    JOIN Employees USING (employeeId)
        WHERE serviceName='${service}' `

  pool.query(query, (err, results) => {
    if (err) {
        console.error('Database Error:', err); // Log the error
        res.status(500).send(err); // Send the error to the client
    } else {
        res.status(200).json(results);
    }
});

}
)


// Add Customer Endpoint
app.post('/addcustomer', (req, res) => {
  const { firstName, lastName, phone, email, address } = req.body;

  // Log the request body for debugging
  console.log('Request Body:', req.body);
  // firstName = req.body.firstName;
  // lastName = req.body.lastName;
  // phone = req.body.phone;
  // email = req.body.email;
  // address = req.body.address;

  const query = `
      INSERT INTO Customers (firstName, lastName, phone, email, address) 
      VALUES (?, ?, ?, ?, ?)`;

  pool.query(query, [firstName, lastName, phone, email, address], (err, results) => {
      if (err) {
          console.error('Database Error:', err); // Log the error
          res.status(500).send(err); // Send the error to the client
      } else {
          console.log('Insert Results:', results); // Log successful insert
          res.status(200).json({ message: 'Customer added successfully!' });
      }
  });
});


// update customer
app.post('/updatecustomer', (req, res) => {
  const { customerId, firstName, lastName, phone, email, address } = req.body;
  const query = `
      UPDATE Customers 
      SET firstName = ?, lastName = ?, phone = ?, email = ?, address = ? 
      WHERE customerId = ?`;
  pool.query(query, [firstName, lastName, phone, email, address, customerId], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Customer updated successfully!' });
  });
});
// Delete customer

app.delete('/deletecustomer/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Customers WHERE customerId = ?`;
  pool.query(query, [id], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Customer deleted successfully!' });
  });
});




app.get('/getemployeeservices',(req,res)=>{
  employeeId = req.query.employeeId

  pool.query(`SELECT serviceName 
    FROM Employee_Specialties 
    WHERE employeeId =${employeeId}`,(err, results)=> {
    if (err) {
        console.error('Error getting', err);
        return;
    }
    console.log(results)
    return res.json(results)

  });
  



})
// add new employee
app.post('/addemployee', (req, res) => {
  const { firstName, lastName, email, workPhone, personalPhone } = req.body;
  const query = `
      INSERT INTO Employees (firstName, lastName, email, workPhone, personalPhone)
      VALUES (?, ?, ?, ?, ?)`;
  pool.query(query, [firstName, lastName, email, workPhone, personalPhone], (err, results) => {
      if (err) return res.status(500).send(err);
      res.status(200).json({ message: 'Employee added successfully!' });
  });
});

// update employee information
app.post('/updateemployee', (req, res) => {
  const { employeeId, firstName, lastName, email, workPhone, personalPhone } = req.body;

  const query = `
      UPDATE Employees 
      SET firstName = ?, lastName = ?, email = ?, workPhone = ?, personalPhone = ? 
      WHERE employeeId = ?`;

  pool.query(query, [firstName, lastName, email, workPhone, personalPhone, employeeId], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Employee updated successfully!' });
  });
});


// delete employee
app.delete('/deleteemployee/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM Employees WHERE employeeId = ?`;
  pool.query(query, [id], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Employee deleted successfully!' });
  });
});

app.post('/updateemployeeservices',(req,res)=>{
  console.log(req.body)
  employeeId = req.body.employeeId
  services = req.body.services;


  pool.query(`delete from employee_specialties where employeeId=${employeeId}`,(err,results)=>{
    if (err) {
        console.error('Error deleting data:', err);
        return;
    }
    else{
      if (services.length==0){
        return res.json({message:'success'})
      }

      const values = services.map(service => [employeeId, service]);

      const sql = `INSERT INTO Employee_Specialties (employeeId, serviceName) VALUES ?`;

      pool.query(sql, [values], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return;
        }
        return res.json({message:'success'})

      });
          

    }

  }
  
  )


})


app.delete('/deletecar/:licensePlate', (req, res) => {
  console.log(req.params)
  const { licensePlate } = req.params;
  const query = `DELETE FROM Cars WHERE licensePlate = '${licensePlate}'`;
  pool.query(query,  (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({ message: 'success' });
  });
});

app.post('/editcar',(req,res) =>{

  const {licensePlate, newLicensePlate, carMake,carModel,carYear,ownerId} = req.body;



  if (!licensePlate || !newLicensePlate || !carMake || !carModel || !carYear || !ownerId) {
    return res.status(400).json({ message: "Invalid input. All fields are required." });
  }
  query = `UPDATE Cars 
  SET licensePlate ='${newLicensePlate}', carMake = '${carMake}', carModel = '${carModel}',
  carYear = ${carYear}, ownerId = ${ownerId} 
  WHERE licensePlate='${licensePlate}';    
  `

  query = `UPDATE Cars 
      SET licensePlate = '${newLicensePlate}', carMake = '${carMake}', 
      carModel = '${carModel}', carYear = ${carYear}, ownerId = ${ownerId}
      WHERE licensePlate = '${licensePlate}';
    `;
  pool.query(query,(err,results)=>{
    if(err){
      console.log(err)
      res.status(404).json({message:"error in updating database",error:err});
    }
    else{
      console.log('car updated')
      return res.json({message:'success'})

    }


  })

})

app.get('/getcars',(req,res) =>{
  console.log('getting cars')

  pool.query(`SELECT Cars.*, customerId ,CONCAT(firstName, ' ',lastName) AS customerName
              FROM Cars
              JOIN Customers ON OwnerId = customerId;`, (err, results) => {
                if (err) {
                  return console.error('Error retrieving Items Table:', err.message);
                } 
                else {
                  console.log('Data in Cars Table joining customer name');
                  console.log(results);
                  return res.json({results})
                }
                })
})

app.post('/addcar',(req,res) =>{
  console.log(req.body)
  licensePlate = req.body.licensePlate
  carMake = req.body.carMake
  carModel = req.body.carModel
  carYear = parseInt(req.body.carYear)
  ownerId = parseInt(req.body.ownerId)

  pool.query(`SELECT * FROM Cars WHERE licensePlate='${licensePlate}'`, (err, results) => {
    if (err) {
      return res.status(404).send('Error retrieving Cars Table:', err.message);
    } else {
      if(results.length>0){
        return res.json({message:'existing'})

      }
      else{
        pool.query(`INSERT INTO Cars () 
          VALUES ('${licensePlate}','${carMake}','${carModel}',${carYear},${ownerId})
          `,(err,results)=>{
            if (err){
              return res.status(404).send('error inserting data '+err)
            }
            else{
              console.log('data inserted')
              return res.json({message:'success'})
            }



        })

      }
    }
    // Close the connection pool
    // pool.end();
  })


  


})

app.get('/getemployees',(req,res)=>{

  pool.query('SELECT * FROM Employees', (err, results) => {
    if (err) {
      return console.error('Error retrieving Employees Table:', err.message);
    } else {
      console.log('Data in Items Table');
      console.log(results);
      return res.json(results)
    }
    // Close the connection pool
    // pool.end();
  })



} )

//delete item
app.delete('/deleteitem/:itemName', (req, res) => {
  const { itemName } = req.params;
  const query = `DELETE FROM Items WHERE itemName = '${itemName}'`;
  pool.query(query,  (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({ message: 'success' });
  });
});



// editing item price or stock
app.post('/edititem',(req,res) =>{

  const {itemName, itemPrice, itemStock} = req.body;

  query = `UPDATE Items 
      SET price = ${itemPrice}, stock=${itemStock}  
      WHERE itemName = '${itemName}';
    `;
  pool.query(query,(err,results)=>{
    if(err){
      console.log(err)
      res.status(404).json({message:"error in updating database",error:err});
    }
    else{
      console.log('item updated')
      return res.json({message:'success'})

    }


  })

})

app.get('/getitems', (req,res) =>{

  pool.query('SELECT * FROM Items', (err, results) => {
    if (err) {
      return console.error('Error retrieving Items Table:', err.message);
    } else {
      console.log('Data in Items Table');
      console.log(results);
      return res.json(results)
    }
    // Close the connection pool
    // pool.end();
  })
}
);


app.post('/additem',(req,res) =>{
  console.log(req.body)
  const {itemName, itemPrice, itemStock} = req.body

  pool.query(`SELECT * FROM items WHERE ItemName='${itemName}}'`, (err, results) => {
    if (err) {
      console.log(err)
      return res.status(404).send('Error retrieving Items Table:', err.message);
    } else {
      if(results.length>0){
        return res.json({message:'existing'})

      }
      else{
        pool.query(`INSERT INTO Items (itemName,price, stock) 
          VALUES ('${itemName}',${itemPrice},${itemStock})
          `,(err,results)=>{
            if (err){
              console.log(err)
              return res.status(404).send('error inserting data '+err)
            }
            else{
              console.log('data inserted')
              return res.json({message:'success'})
            }



        })

      }
    }

  })

})


// delete a service
app.delete('/deleteservice/:serviceName', (req, res) => {
  const { serviceName } = req.params;
  const query = `DELETE FROM Services WHERE serviceName = '${serviceName}'`;
  pool.query(query,  (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({ message: 'success' });
  });
});

//adding service
app.post('/addservice',(req,res) =>{
  console.log(req.body)

  const {serviceName,serviceDescription,} = req.body;

  pool.query('SELECT * FROM Services WHERE serviceName = ?', [serviceName], (err, results) => {
    if (err) {
        return res.status(404).send('Error retrieving Service Table:', err.message);
    }
    console.log(results);

    if (results.length > 0) {
        console.log('data not added');
        return res.json({message: 'existing'});
    }

    pool.query('INSERT INTO Services (serviceName, serviceDescription) VALUES (?, ?)', 
        [serviceName, serviceDescription], 
        (err, results) => {
            if (err) {
                return res.status(404).send('Error inserting data: ' + err.message);
            }
            console.log('data inserted');
            return res.json({message: 'success'});
        }
    );
});



})

// edit service information
app.post('/editservice',(req,res) =>{

  console.log(req.body)
  const {newServiceDescription, serviceName} = req.body;
 
  query = `UPDATE Services 
      SET serviceDescription = '${newServiceDescription}'
      WHERE serviceName = '${serviceName}';
    `;
  pool.query(query,(err,results)=>{
    if(err){
      console.log(err)
      res.status(404).json({message:"error in updating database",error:err});
    }
    else{
      console.log('service updated')
      return res.json({message:'success'})

    }


  })

})


app.get('/getservices', (req,res) =>{
  // Query to get all tables in the database
  pool.query('SELECT * FROM Services', (err, results) => {
    if (err) {
      return console.error('Error retrieving Services Table:', err.message);
    } else {
      console.log('Data in Services Table');
      console.log(results);
      return res.json(results)
    }
    // Close the connection pool
    // pool.end();
  })
}
);



app.get('/getcustomers', (req,res) =>{
  // Query to get all tables in the database
  pool.query('SELECT * FROM Customers', (err, results) => {
    if (err) {
      return console.error('Error retrieving Customers Table:', err.message);
    } else {
      console.log('Data in Customers Table');
      console.log(results);
      return res.json(results)
    }
    // Close the connection pool
    // pool.end();
  });
})



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html','car-shop-index.html'));
});
app.get('/:file', (req, res) => {
  file = req.params.file

  res.sendFile(path.join(__dirname, 'public_html',file));
});
  
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at port ${port}`);
});

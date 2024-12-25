// alert('vehicles.js being read')

fetch('/getappts',{    
    method: 'GET',
    }
)
    .then(response => response.json())
    .then(data =>{
        console.log(data)

        const apptTable = document.getElementById('apptTable').getElementsByTagName("tbody")[0];

        data.forEach(appointment => {
            // Create a new row for each appointment
            const newRow = apptTable.insertRow()

            // create new columns
            const apptDate = newRow.insertCell(0);
            const apptTime = newRow.insertCell(1);
            const apptCustomer = newRow.insertCell(2);
            const apptVehicle = newRow.insertCell(3);
            const apptIssue = newRow.insertCell(4);
            const apptService = newRow.insertCell(5);
            const apptEmployee = newRow.insertCell(6);
            const apptFinished = newRow.insertCell(7);
            const apptActions = newRow.insertCell(8);

            // Format and insert appointment date and time
            apptDate.textContent = new Date(appointment.date).toLocaleDateString(); // Correct the date format
            apptTime.textContent = formatTime(appointment.time); // Use your formatTime function to format the time
            apptCustomer.textContent = appointment.customerName;
            apptVehicle.textContent = appointment.vehicle;
            apptIssue.textContent = appointment.issue;
            apptService.textContent = appointment.serviceName;
            apptEmployee.textContent = appointment.employeeName;
            

            apptFinished.textContent = (function() {
                if(appointment.finished){
                    return "Yes"
                }
                else{
                    return "No"
                }
            })();

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";




            editButton.onclick = function () {
                openModal('editmodal');
                const editServiceOption = document.getElementById('editservices');
                const editEmployeeOption = document.getElementById('editemployees');
                const editItemCheckbox = document.getElementById('edititems');
                const editApptDate = document.getElementById('editApptDate');
                const editApptTime = document.getElementById('editApptTime');
                const editApptIssue = document.getElementById('editApptIssue');
                const editCars = document.getElementById('editcars');
            
                // Apply margin: 0 auto to center the elements
                editEmployeeOption.style.margin = '0 auto';
                editItemCheckbox.style.margin = '0 auto';
            
                // Set initial values from appointment
                editServiceOption.value = appointment.serviceName;
                editApptDate.value = new Date(appointment.date).toISOString().split('T')[0];
                editApptTime.value = appointment.time;
                editApptIssue.value = appointment.issue;
                editCars.value = appointment.carId;
                editCars.disabled = true;
            
                // Fetch employees based on selected service
                function fetchEmployees(serviceName, callback) {
                    fetch(`/getserviceemployees?service=${serviceName}`, { method: 'GET' })
                        .then(response => response.json())
                        .then(callback)
                        .catch(error => console.error('Error sending data:', error));
                }
            
                // Populate employees in dropdown
                function populateEmployeeDropdown(employees) {
                    editEmployeeOption.innerHTML = '';
                    if (employees.length === 0) {
                        alert('No Employee assigned to this service!');
                        editEmployeeOption.style.display = 'none';
                        document.getElementById('edititems').style.display = 'none';
                        editServiceOption.value = '';
                        return;
                    }
            
                    editEmployeeOption.style.display = 'block';
                    document.getElementById('edititems').style.display = 'block';
            
                    employees.forEach(employee => {
                        const option = document.createElement('option');
                        option.textContent = `${employee.firstName} ${employee.lastName}`;
                        option.value = employee.employeeId;
                        editEmployeeOption.appendChild(option);
                    });
            
                    // Set selected employee based on appointment data
                    editEmployeeOption.value = appointment.employeeId;
                }
            
                // Initial employee population
                fetchEmployees(appointment.serviceName, populateEmployeeDropdown);
            
                // Update employee list on service change
                editServiceOption.addEventListener('change', event => {
                    const selectedValue = event.target.value;
                    fetchEmployees(selectedValue, populateEmployeeDropdown);
                });
            
                // Fetch and update items used in appointment
                fetch(`/getitemsused?apptId=${appointment.appointmentId}`, { method: 'GET' })
                    .then(response => response.json())
                    .then(data => {
                        const items = data.map(d => d.itemName);
                        const checkboxes = editItemCheckbox.querySelectorAll('input[type="checkbox"]');
                        checkboxes.forEach(checkbox => {
                            checkbox.checked = items.includes(checkbox.value);
                        });
                    })
                    .catch(error => console.error("Error retrieving items used:", error));

            document.getElementById('editappt').onclick = function () {
                alert('editing appointment')
                // Collect the data from the form or modal
                const date = document.getElementById('editApptDate').value;
                const time = document.getElementById('editApptTime').value;
                const issue = document.getElementById('editApptIssue').value;
                const serviceName = document.getElementById('editservices').value;
                const employeeId = document.getElementById('editemployees').value;
                const carId = document.getElementById('editcars').value;
                

                
                if (!date || !time  || !issue ||
                    !carId || !serviceName || !employeeId
                ){
                    alert("Fill out everything!");
                    return
                 }
                const formData = {
                    appointmentId:appointment.appointmentId,
                    date:date,
                    time:time,
                    issue:issue,
                    serviceName:serviceName,
                    employeeId:employeeId,
                    carId:carId,
                    items:getCheckedItems('edititems')
                };

                // Make the PUT request to the backend to update the appointment
                fetch('/editappt', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.message === 'success') {
                        alert('Appointment successfully edited');
                        location.reload(); // Optionally reload the page to reflect changes
                    } else {
                        alert('There was an error editing the appointment');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error with the request');
                });
            };
            document.getElementById('deleteappt').onclick = function(){
                alert('deleting appt '+appointment.appointmentId)
                fetch(`/deleteappt/${appointment.appointmentId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)                        
                        if (data.message=='success'){
                            alert('appointment successfully deleted')
                            location.reload(); // Reload to reflect changes


                        }
                        else{
                            alert('logical error')
                        }
                    })
                    .catch(error => {
                        
                        alert("error")
                        console.log(error)
                    })


            }
            };


            // Append the row to the table body
            apptActions.appendChild(editButton);
        });


    })
    .catch(error => 
        console.log("error retrieving appointments "+ error)

    )

fetch('/getcars', {
    method: 'GET',
    })
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        console.log(data)
        cars = data.results

        carOption = document.getElementById('cars')
        editCarOption = document.getElementById('editcars')

        cars.forEach(car => {
            // Create an option element


            const option = document.createElement('option');
            // Set the option text and value
            option.textContent = `${car.customerName} - ${car.carMake} ${car.carModel} ${car.carYear}`; // Use `car.name` if car is an object, or `car` if it's a string
            option.value = car.licensePlate; // Similarly, use `car.value` or the raw car data

            // Append the option to the select element
            carOption.appendChild(option);


            
            const option2 = document.createElement('option');
            // Set the option text and value
            option2.textContent = `${car.customerName} - ${car.carMake} ${car.carModel} ${car.carYear}`; // Use `car.name` if car is an object, or `car` if it's a string
            option2.value = car.licensePlate; // Similarly, use `car.value` or the raw car data


            editCarOption.appendChild(option2);
        });




    })

    .catch(error => {
        console.error('Error sending data:', error);
    });



fetch('/getservices', {
    method: 'GET',
    })
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        // console.log('Response from server:', data);

        console.log(data)
  
        serviceOption = document.getElementById('services')
        editServiceOption = document.getElementById('editservices')


        data.forEach(service => {
            // Create an option element


            const option = document.createElement('option');
            // Set the option text and value
            option.textContent = service.serviceName; // Use `car.name` if car is an object, or `car` if it's a string
            option.value = service.serviceName; // Similarly, use `car.value` or the raw car data

            // Append the option to the select element
            serviceOption.appendChild(option);

            
            const option2 = document.createElement('option');
            // Set the option text and value
            option2.textContent = service.serviceName; // Use `car.name` if car is an object, or `car` if it's a string
            option2.value = service.serviceName; // Similarly, use `car.value` or the raw car data

            // Append the option to the select element
            editServiceOption.appendChild(option2);


        });

        serviceOption.addEventListener('change', event => {
            const selectedValue = event.target.value;
            // alert(`You selected: ${selectedValue}`);
            employeeOption = document.getElementById('employees')

            editEmployeeOption = document.getElementById('editemployees')

            // Clear all existing options

            fetch(`/getserviceemployees?service=${selectedValue}`, {
                method: 'GET',
                })
            .then(response => response.json())  // Parsing the JSON response
            .then(employees => {
                employeeOption.innerHTML = ''; 



                if(employees.length==0){
                    alert(`No Employee assigned to this service!`)
                    document.getElementById('items').style.display='none'
                    employeeOption.style='display: none;'
                    serviceOption.value=""
                    return
                }

                employeeOption.style='display: block; margin: 0 auto;'
    
                document.getElementById('items').style='display:block; margin: 0 auto; align:center;'


                employees.forEach(employee => {

                    const option = document.createElement('option');
                    // Set the option text and value
                    option.textContent = employee.firstName +" "+employee.lastName // Use `car.name` if car is an object, or `car` if it's a string
                    option.value = employee.employeeId; // Similarly, use `car.value` or the raw car data
        

                    
                    const option2 = document.createElement('option');
                    // Set the option text and value
                    option2.textContent = employee.firstName +" "+employee.lastName // Use `car.name` if car is an object, or `car` if it's a string
                    option2.value = employee.employeeId; // Similarly, use `car.value` or the raw car data
        
                    // Append the option to the select element
                    employeeOption.appendChild(option);
                    editEmployeeOption.appendChild(option2);

                    

                    
    

                })


            })
            .catch(error => {
                console.error('Error sending data:', error);
            });
        })






    })
    .catch(error => {
        console.error('Error sending data:', error);
    });

    fetch('/getitems', {
        method: 'GET',
        })
        .then(response => response.json())  // Parsing the JSON response
        .then(data => {
            console.log('Response from server:', data);

            itemCheckbox = document.getElementById('items')

            editItemCheckbox = document.getElementById('edititems')
            data.forEach(item =>{

                if (item.stock==0){
                    return
                }
                
                // Create a label for the checkbox
                const label = document.createElement('label');
                label.textContent = item.itemName;
                label.htmlFor = item.itemName;

                // Create the checkbox input
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = item.itemName;
                checkbox.name = item.itemName;
                checkbox.value = item.itemName;

                // Append the checkbox and label to the items div
                itemCheckbox.appendChild(label);
                itemCheckbox.appendChild(checkbox);
                itemCheckbox.appendChild(document.createElement('br')); // Add a line break for spacing
                itemCheckbox.appendChild(document.createElement('br')); // Add a line break for spacing


                // Create a label for the checkbox
                const label2 = document.createElement('label');
                label2.textContent = item.itemName;
                label2.htmlFor = item.itemName;

                // Create the checkbox input
                const checkbox2 = document.createElement('input');
                checkbox2.type = 'checkbox';
                checkbox2.id = item.itemName;
                checkbox2.name = item.itemName;
                checkbox2.value = item.itemName;


                editItemCheckbox.appendChild(label2);
                editItemCheckbox.appendChild(checkbox2);
                editItemCheckbox.appendChild(document.createElement('br')); // Add a line break for spacing
                editItemCheckbox.appendChild(document.createElement('br')); // Add a line break for spacing



            } )
    
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });

document.getElementById('addappt').onclick = function(){
    alert('adding appointment')

    apptDate = document.getElementById('apptDate').value
    apptTime = document.getElementById('apptTime').value
    apptIssue = document.getElementById('apptIssue').value

    carId = document.getElementById('cars').value
    service = document.getElementById('services').value
    employeeId = document.getElementById('employees').value


    if (!apptDate || !apptTime  || !apptIssue ||
        !carId || !service || !employeeId
    ){
        alert("Fill out everything!");
        return

    }
    checkedItems = getCheckedItems('items')
    formData = {
        date:apptDate,
        time: apptTime,
        issue: apptIssue,
        carId: carId,
        service: service,
        employeeId:employeeId,
        items: checkedItems
    }
    console.log(formData)


    fetch('addappt', {
        method: 'POST',  // Use POST to add data to the server
        headers: {
            'Content-Type': 'application/json'  // Inform server we're sending JSON data
        },
        body: JSON.stringify(formData)})
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        if (data.message=='success'){
            alert("appointment added to database")
            location.reload();

        }
        else{
            alert('logical error')
        }
    })
    .catch(error => {
        console.error('Error sending data:', error);
    });

        
}

// Function to get checked items
function getCheckedItems(id) {

    const itemCheckbox = document.getElementById(id);


    // Get all checkboxes inside the itemCheckbox div
    const checkboxes = itemCheckbox.querySelectorAll('input[type="checkbox"]');
    const checkedItems = [];

    // Iterate over checkboxes and collect checked ones
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkedItems.push(checkbox.value);
        }
    });

    return checkedItems;
}


// Function to format time as 12-hour format with AM/PM
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
}

function getItemsUsed(appt) {
    // Return the fetch promise to ensure it resolves with employee services data
    return fetch(`/getemployeeservices?employeeId=${employee.employeeId}`, {
        method: 'GET',
    })
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        console.log('Response from server:', data);
        // Map the data to extract service names and return them
        return data.map(item => item.serviceName);
    })
    .catch(error => {
        console.error('Error sending data:', error);
        // Optionally return an empty array in case of error
        return [];
    });
}


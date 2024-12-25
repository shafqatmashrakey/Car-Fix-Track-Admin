fetch('/getemployees', {
    method: 'GET',
})
    .then(response => response.json()) // Parsing the JSON response
    .then(data => {
        console.log('Response from server:', data);

        const employeeTable = document.getElementById('employeeTable').getElementsByTagName("tbody")[0];
        const searchInput = document.getElementById('searchEmployee');
        let allEmployees = data; // Store all employees for search functionality

        // Populate the table with all employees
        populateEmployeeTable(allEmployees);

        // Add search functionality
        searchInput.addEventListener('input', function () {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredEmployees = allEmployees.filter(employee =>
                `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm)
            );
            populateEmployeeTable(filteredEmployees);
        });

        // Function to populate the employee table
        function populateEmployeeTable(employees) {
            employeeTable.innerHTML = ''; // Clear the table first
            employees.forEach(employee => {
                const newRow = employeeTable.insertRow();
                const employeeId = newRow.insertCell(0);
                const employeeName = newRow.insertCell(1);
                const employeeEmail = newRow.insertCell(2);
                const workPhone = newRow.insertCell(3);
                const personalPhone = newRow.insertCell(4);
                const totalAppts = newRow.insertCell(5);
                const cellActions = newRow.insertCell(6);
                const cellActions2 = newRow.insertCell(7);
                const cellActions3 = newRow.insertCell(8);

                // Fill in the cells with data
                employeeId.textContent = employee.employeeId;
                employeeName.textContent = `${employee.firstName} ${employee.lastName}`;
                employeeEmail.textContent = employee.email;
                workPhone.textContent = employee.workPhone;
                personalPhone.textContent = employee.personalPhone;
                totalAppts.textContent = employee.totalAppts;

                // Create an Edit button
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.onclick = function () {
                    openModal('editmodal');
                    document.getElementById('editFName').value = employee.firstName;
                    document.getElementById('editLName').value = employee.lastName;
                    document.getElementById('editEmail').value = employee.email;
                    document.getElementById('editWorkPhoneNum').value = employee.workPhone;
                    document.getElementById('editPersonalPhoneNum').value = employee.personalPhone;

                    document.getElementById('editemployee').onclick = function () {
                        const updatedEmployee = {
                            employeeId: employee.employeeId,
                            firstName: document.getElementById('editFName').value,
                            lastName: document.getElementById('editLName').value,
                            email: document.getElementById('editEmail').value,
                            workPhone: document.getElementById('editWorkPhoneNum').value,
                            personalPhone: document.getElementById('editPersonalPhoneNum').value,
                        };

                        fetch('/updateemployee', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedEmployee),
                        })
                            .then(response => response.json())
                            .then(data => {
                                alert('Employee updated successfully!');
                                closeModal('editmodal');
                                location.reload(); // Reload to reflect updated data
                            })
                            .catch(error => console.error('Error updating employee:', error));
                    };
                };

                // Create an Edit Services button
                const editServices = document.createElement("button");
                editServices.textContent = "Edit Services";
                editServices.onclick = function () {
                    openModal('editservices');
                    getServices(employee);
                };

                // Create a View Services button
                const viewServices = document.createElement("button");
                viewServices.textContent = "View Services";
                viewServices.onclick = function () {
                    openModal('viewservices');
                    viewEmployeeServices(employee);
                };

                // Append buttons to the appropriate cells
                cellActions.appendChild(editButton);
                cellActions2.appendChild(editServices);
                cellActions3.appendChild(viewServices);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching employees:', error);
    });

// Search Bar HTML
// Add this to your HTML above the employee table
// <div class="search-bar">
//     <button class="add-button" id="addEmployee">Add New Employee</button>
//     <input type="text" id="searchEmployee" placeholder="Search by Employee Name">
// </div>

// Add New Employee functionality
addNewEmployee = document.getElementById('addNewEmployee');
addNewEmployee.onclick = function () { 
    const newEmployee = {
        firstName: document.getElementById('fname').value,
        lastName: document.getElementById('lname').value,
        email: document.getElementById('email').value,
        workPhone: document.getElementById('workPhoneNum').value,
        personalPhone: document.getElementById('personalPhoneNum').value,
    };

    fetch('/addemployee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
    })
        .then(response => response.json())
        .then(data => {
            alert('New employee added successfully!');
            closeModal('modal');
            location.reload(); // Reload to reflect changes
        })
        .catch(error => {
            console.error('Error adding employee:', error);
            alert('Failed to add employee. Please try again.');
        });
};

function getServices(employee){

    fetch('/getservices', {
        method: 'GET',
        })
        .then(response => response.json())  // Parsing the JSON response
        .then(data => {
            console.log('Response from server:', data);

            
            const servicesList = document.getElementById('servicesList');
            servicesList.innerHTML = '';  // Clear previous checkboxes

            getEmployeeServices(employee)
            .then(employeeServices => {
                console.log('Employee services:', employeeServices);
                // Now you can use employeeServices here

                // Create checkboxes based on services returned from the server
                data.forEach(service => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = service.serviceName;
                    checkbox.name = 'services';
                    checkbox.value = service.serviceName;

                    // Check if the service is in the employeeServices list
                    if (employeeServices.includes(service.serviceName)) {
                        checkbox.checked = true;  // Pre-check the checkbox if the employee uses the service
                    }

                    // Label for the checkbox
                    const label = document.createElement('label');
                    label.htmlFor = service.serviceName;
                    label.textContent = service.serviceName;

                    // Append the checkbox and label to the services list
                    servicesList.appendChild(checkbox);
                    servicesList.appendChild(label);
                    servicesList.appendChild(document.createElement('br')); // Line break
                    servicesList.appendChild(document.createElement('br')); // Line break
                });

                // Handling the "updateServices" button click event
                document.getElementById('updateServices').onclick = function() {
                    alert('Updating services for ' + employee.firstName + " " + employee.lastName);

                    // Collect the checked checkboxes
                    const checkedServices = [];
                    const checkboxes = document.querySelectorAll('#servicesList input[type="checkbox"]:checked');

                    checkboxes.forEach(checkbox => {
                        checkedServices.push(checkbox.value);
                    });

                    // Log or send the selected services to the server
                    updateServices(employee, checkedServices);
                };
            })
            .catch(error => {
                console.error('Error getting employee services:', error);
            });
          
    
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });


}

function updateServices(employee,services){
    console.log(`Employee:${employee.employeeId}  Selected services: ${services}`);

    fetch('/updateemployeeservices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Indicates that the data is in JSON format
        },
        body: JSON.stringify({employeeId:employee.employeeId,services:services}),
        })
        .then(response => response.json())  // Parsing the JSON response
        .then(data => {
            console.log('Response from server:', data);
            
            if(data.message=='success'){
                alert('services updated for '+employee.firstName+' '+employee.lastName)
            }
    
        })
        .catch(error => {
            console.error('Error sending data:', error);
        });

}


function getEmployeeServices(employee) {
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
function viewEmployeeServices(employee){
    getEmployeeServices(employee)
    .then(employeeServices => {
        console.log('Employee services:', employeeServices);
        document.getElementById('viewheader').innerHTML=`Services offered by ${employee.firstName} ${employee.lastName}`
    
        const viewServicesList = document.getElementById('offeredservices');
        viewServicesList.innerText = ''; // This clears the existing content
        if (employeeServices.length==0){
            viewServicesList.innerHTML = `${employee.firstName} ${employee.lastName} has no offered services at the moment`
            return
        }
        // document.getElementById('offeredservices').innerHTML=`Services offered by ${employee.firstName} ${employee.lastName}`
        
        viewServicesHTML = ''
       // Loop through each service and create a new element with a line break
        employeeServices.forEach(service => {
            console.log(service)
            viewServicesHTML+= `${service} <br><br>`
        });   
        viewServicesList.innerHTML = viewServicesHTML;
            
    
    })
    .catch(error => {
        console.error('Error getting employee services:', error);
    });
  

}

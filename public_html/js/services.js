fetch('/getservices', {
    method: 'GET',
    })
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        console.log('Response from server:', data);

        serviceTable = document.getElementById('serviceTable').getElementsByTagName("tbody")[0];
        
        data.forEach(service => {
            const newRow = serviceTable.insertRow();
            const serviceName = newRow.insertCell(0);
            const serviceDescription = newRow.insertCell(1);
            const cellActions = newRow.insertCell(2);

            // Fill in the cells with data
            serviceName.textContent = service.serviceName;
            serviceDescription.textContent = service.serviceDescription;



            // Create an Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = function() {
                // Add logic to handle the edit action
                // alert("for "+ customer.firstName+" "+customer.lastName)
                openModal('editmodal')
                document.getElementById('editServiceName').value = service.serviceName
                document.getElementById('editServiceDescription').value = service.serviceDescription
                
                document.getElementById('editServiceName').disabled = true;
                
                document.getElementById('editservice').onclick = function(){

                    newServiceDescription = document.getElementById('editServiceDescription').value
                    
                    serviceData = {
                        newServiceDescription:newServiceDescription,
                        serviceName: service.serviceName
                    }

                    alert('editing ' + service.serviceName)

                    fetch('/editservice', {
                        method: 'POST',  // Use POST to add data to the server
                        headers: {
                            'Content-Type': 'application/json'  // Inform server we're sending JSON data
                        },
                        body: JSON.stringify(serviceData)})
                    .then(response => response.json())
                    .then(data =>{
                        console.log(data)
                        if (data.message=='success'){
                            alert("service edited")
                            location.reload()
            
                        }
                        else{
                            alert('logical error')
                        }
                    })
                    .catch(error => {
                        console.error('Error sending data:', error);
                    });
                        


                }

                document.getElementById('deleteservice').onclick = function(){
                    alert('deleting ' + service.serviceName)

                    fetch(`/deleteservice/${service.serviceName}`, {
                        method: 'DELETE',
                    })
                        .then(response => response.json())
                        .then(data => {
                            alert('Service deleted successfully!');
                            closeModal('editmodal');
                            location.reload(); // Reload to reflect changes
                        })
                        .catch(error => console.error('Error deleting service:', error));

                }

            };

            // Append the Edit button to the last cell (cellActions)
            cellActions.appendChild(editButton);
                
            
        });
        

    })
    .catch(error => {
        console.error('Error sending data:', error);
    });


document.getElementById('addNewService').onclick = function(){
    alert('adding service')

    newService = {
        serviceName: document.getElementById('serviceName').value,
        serviceDescription: document.getElementById('serviceDescription').value

    }

    
    fetch('/addservice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data)
        if (data.message=='existing'){
            alert("Service already exists!")
        }
        else if (data.message=='success'){
            alert('Service successfully added')
            location.reload(); // Reload to reflect changes

        }
        else{
            alert('logical error')
        }
        
     
    })
    .catch(error => {
        console.error('Error adding new customer:', error);
        alert('Failed to add customer. Please try again.');
    });

}



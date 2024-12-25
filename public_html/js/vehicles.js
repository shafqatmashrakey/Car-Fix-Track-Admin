// alert('vehicles.js being read')
fetch('/getcars', {
    method: 'GET',
    })
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        cars = data.results
        console.log(cars)

        carTable = document.getElementById('carTable').getElementsByTagName("tbody")[0];

        
        // If `data` is an array of customers
        cars.forEach(car => {
            const newRow = carTable.insertRow();
            const cellLicensePlate = newRow.insertCell(0);
            const cellOwner = newRow.insertCell(1);
            const cellModel = newRow.insertCell(2);
            const cellMake = newRow.insertCell(3);
            const cellYear = newRow.insertCell(4);
            const cellActions = newRow.insertCell(5);

            // Fill in the cells with data
            cellLicensePlate.textContent = car.licensePlate;
            cellOwner.textContent = car.customerName;
            cellModel.textContent = car.carModel;
            cellMake.textContent = car.carMake;
            cellYear.textContent = car.carYear;
            // cellVehicles.textContent = customer.vehicles || "N/A";


            const [state, licensePlate] = car.licensePlate.split('-');

            // Create an Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = function() {
                document.getElementById('editState').disabled = true;
                document.getElementById('editLicensePlate').disabled = true;

                openModal('editmodal')
                document.getElementById('editState').value = state;
                document.getElementById('editLicensePlate').value = licensePlate;
                document.getElementById('editCarMake').value = car.carMake
                document.getElementById('editCarModel').value = car.carModel
                document.getElementById('editCarYear').value = car.carYear
                document.getElementById('editOwner').value = car.ownerId

                document.getElementById('editcar').onclick = function(){
                    alert('editing car '+car.licensePlate);

                    carData = {
                        licensePlate: car.licensePlate,
                        newLicensePlate: document.getElementById('editState').value+"-"+document.getElementById('editLicensePlate').value,
                        carMake: document.getElementById('editCarMake').value,
                        carModel: document.getElementById('editCarModel').value,
                        carYear: document.getElementById('editCarYear').value,
                        ownerId: document.getElementById('editOwner').value
                    }

                    fetch('/editcar', {
                        method: 'POST',  // Use POST to add data to the server
                        headers: {
                            'Content-Type': 'application/json'  // Inform server we're sending JSON data
                        },
                        body: JSON.stringify(carData)})
                    .then(response => response.json())
                    .then(data =>{
                        console.log(data)
                        if (data.message=='success'){
                            alert("car edited")
                            location.reload()
            
                        }
                        else{
                            alert('logical error')
                        }
                    })
                    .catch(error => {
                        console.error('Error sending data:', error);
                    });
                        


                };

                document.getElementById('deletecar').onclick = function(){
                    alert('deleting car '+car.licensePlate)
                    fetch(`/deletecar/${car.licensePlate}`, {
                        method: 'DELETE',
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log(data)
                            if (data.message=='success'){
                                alert('Vehicle deleted successfully!');
                                closeModal('editmodal');
                                location.reload(); // Reload to reflect changes
                        
                            }
                            else{
                                alert('logical error');
                            }
                        })
                        .catch(error => console.error('Error deleting car:', error));
                }

            };

            // Append the Edit button to the last cell (cellActions)
            cellActions.appendChild(editButton);
                
            
        });



    })

    .catch(error => {
        console.error('Error sending data:', error);
    });





fetch('/getcustomers', {
    method: 'GET',
})
    .then(response => response.json())  // Parsing the JSON response
    .then(customers => {
        console.log(customers)

        const customerSelect = document.getElementById("customers");
        const editOwnerSelect = document.getElementById('editOwner')

        customers.forEach(customer =>{

            // in adding the vehicle popup
            const option1 = document.createElement('option');
            option1.value = customer.customerId
            option1.textContent = customer.customerId+". "+customer.firstName+" "+customer.lastName
            customerSelect.appendChild(option1);


            // in editing the vehicle popup
            const option2 = document.createElement('option');
            option2.value = customer.customerId
            option2.textContent = customer.customerId+". "+customer.firstName+" "+customer.lastName
            editOwnerSelect.appendChild(option2);

        }


        )

    })

    .catch(error => {
        console.error('Error sending data:', error);
    });



document.getElementById('addcar').onclick = function(){
    addCar()

}

function addCar(){
    state = document.getElementById('state').value
    plateNumber = document.getElementById('licensePlate').value
    
    licensePlate = `${state}-${plateNumber}`
    carMake = document.getElementById('carMake').value
    carModel = document.getElementById('carModel').value
    carYear = document.getElementById('carYear').value
    ownerId = document.getElementById('customers').value

    const carData = {
        licensePlate:licensePlate,
        carMake: carMake,
        carModel: carModel,
        carYear: carYear,
        ownerId:ownerId
    };

    if(!state || !plateNumber || !carMake || !carModel || !carYear || !ownerId){
        alert("Fill up everything!")
        
    }
    else{

        fetch('addcar', {
            method: 'POST',  // Use POST to add data to the server
            headers: {
                'Content-Type': 'application/json'  // Inform server we're sending JSON data
            },
            body: JSON.stringify(carData)})
        .then(response => response.json())
        .then(data =>{
            if (data.message=='success'){
                alert("car added to database")
                location.reload();

            }
            else if(data.message=='existing'){
                alert("Car with Plate Number already exists")
                plateNumber.value=""

            }
            else{
                alert('logical error')
            }
        })
            
        // alert('car added to database')
    }





}
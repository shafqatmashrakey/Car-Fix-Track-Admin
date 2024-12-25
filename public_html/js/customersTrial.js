fetch('/getcustomers', {
    method: 'GET',
})
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        console.log('Response from server:', data);

        customerTable = document.getElementById('customerTable').getElementsByTagName("tbody")[0];

        // If `data` is an array of customers
        data.forEach(customer => {
            newRow = customerTable.insertRow();
            cellId = newRow.insertCell(0);
            cellName = newRow.insertCell(1);
            cellPhone = newRow.insertCell(2);
            cellEmail = newRow.insertCell(3);
            cellAddress = newRow.insertCell(4);
            cellActions = newRow.insertCell(5);

            // Fill in the cells with data
            cellId.textContent = customer.customerId;
            cellName.textContent = customer.firstName + " " + customer.lastName;
            cellPhone.textContent = customer.phone;
            cellEmail.textContent = customer.email;
            cellAddress.textContent = customer.address;

            // Create an Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = function () {
                openModal('editmodal');
                document.getElementById('editFName').value = customer.firstName;
                document.getElementById('editLName').value = customer.lastName;
                document.getElementById('editPhoneNum').value = customer.phone;
                document.getElementById('editEmail').value = customer.email;
                document.getElementById('editAddress').value = customer.address;

                const editCustomer = document.getElementById('editCustomer');
                editCustomer.onclick = function () {
                    const updatedCustomer = {
                        customerId: customer.customerId,
                        firstName: document.getElementById('editFName').value,
                        lastName: document.getElementById('editLName').value,
                        phone: document.getElementById('editPhoneNum').value,
                        email: document.getElementById('editEmail').value,
                        address: document.getElementById('editAddress').value,
                    };

                    fetch('/updatecustomer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedCustomer),
                    })
                        .then(response => response.json())
                        .then(data => {
                            alert('Customer updated successfully!');
                            closeModal('editmodal');
                            location.reload(); // Reload to reflect changes
                        })
                        .catch(error => console.error('Error updating customer:', error));
                };

                const deleteCustomer = document.getElementById('deleteCustomer');
                deleteCustomer.onclick = function () {
                    fetch(`/deletecustomer/${customer.customerId}`, {
                        method: 'DELETE',
                    })
                        .then(response => response.json())
                        .then(data => {
                            alert('Customer deleted successfully!');
                            closeModal('editmodal');
                            location.reload(); // Reload to reflect changes
                        })
                        .catch(error => console.error('Error deleting customer:', error));
                };
            };

            // Append the Edit button to the last cell (cellActions)
            cellActions.appendChild(editButton);
        });
    })
    .catch(error => {
        console.error('Error fetching customers:', error);
    });

document.getElementById('addNewCustomer').onclick = function () {
    const newCustomer = {
        firstName: document.getElementById('fname').value,
        lastName: document.getElementById('lname').value,
        phone: document.getElementById('phoneNum').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
    };

    fetch('/addcustomer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert('New customer added successfully!');
            closeModal('modal');
            location.reload(); // Reload to reflect changes
        })
        .catch(error => {
            console.error('Error adding new customer:', error);
            alert('Failed to add customer. Please try again.');
        });
};

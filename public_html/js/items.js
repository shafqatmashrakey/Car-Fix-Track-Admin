fetch('/getitems', {
    method: 'GET',
    })
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        console.log('Response from server:', data);

        itemTable = document.getElementById('itemTable').getElementsByTagName("tbody")[0];
        
        data.forEach(item => {
            const newRow = itemTable.insertRow();
            const itemName = newRow.insertCell(0);
            const itemPrice = newRow.insertCell(1);
            const itemStock = newRow.insertCell(2);
            const cellActions = newRow.insertCell(3);

            // Fill in the cells with data
            itemName.textContent = item.itemName;
            itemPrice.textContent = '$'+item.price;
            itemStock.textContent = item.stock;





            // Create an Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.onclick = function() {
                // Add logic to handle the edit action
                // alert("for "+ customer.firstName+" "+customer.lastName)
                openModal('editmodal')
                document.getElementById('editItemName').disabled = true;

                document.getElementById('editItemName').value = item.itemName
                document.getElementById('editItemPrice').value = item.price
                document.getElementById('editItemStock').value = item.stock

               
                document.getElementById('edititem').onclick = function(){
                    alert(`editing ${item.itemName}`)

                    itemData = {
                        itemName:item.itemName,
                        itemPrice:document.getElementById('editItemPrice').value,
                        itemStock:document.getElementById('editItemStock').value
                    }
                    fetch('/edititem', {
                        method: 'POST',  // Use POST to add data to the server
                        headers: {
                            'Content-Type': 'application/json'  // Inform server we're sending JSON data
                        },
                        body: JSON.stringify(itemData)})
                    .then(response => response.json())
                    .then(data =>{
                        console.log(data)
                        if (data.message=='success'){
                            alert("item edited")
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

                document.getElementById('deleteitem').onclick = function(){
                    alert('deleting '+item.itemName)

                    fetch(`/deleteitem/${item.itemName}`, {
                        method: 'DELETE',
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.message == 'success'){
                                alert('Item deleted successfully!');
                                closeModal('editmodal');
                                location.reload(); // Reload to reflect changes
                            }
                            else{
                                alert('logical error')
                            }

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

    document.getElementById('addNewItem').onclick = function(){
        alert('adding item')

        newItem ={
            itemName : document.getElementById('itemName').value,
            itemPrice : parseFloat(document.getElementById('itemPrice').value),
            itemStock : parseInt(document.getElementById('itemStock').value),
        }
        console.log(newItem);

        fetch('/additem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem),
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
                alert("Item already exists!")
            }
            else if (data.message=='success'){
                alert('Item successfully added')
                location.reload(); // Reload to reflect changes
    
            }
            else{
                alert('logical error')
            }
            
         
        })
        .catch(error => {
            console.error('Error adding new customer:', error);
            alert('Failed to add item. Please try again.');
        });
    




    }


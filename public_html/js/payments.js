fetch('/getpayments',{
    method:'GET'
})
.then(response => response.json())
.then(data =>{
    console.log(data)

    const paymentTable = document.getElementById('paymentTable').getElementsByTagName("tbody")[0];

    data.forEach(payment=>{
        const newRow = paymentTable.insertRow()

        // create new columns
        const customer = newRow.insertCell(0);
        const apptDate = newRow.insertCell(1);
        const totalCharge = newRow.insertCell(2);
        const totalPaid = newRow.insertCell(3);
        const duePayment = newRow.insertCell(4);
        const fullyPaid = newRow.insertCell(5);
        const actions = newRow.insertCell(6);

        customer.textContent = payment.customerName
        apptDate.textContent = new Date(payment.date).toLocaleDateString();  
        totalCharge.textContent = "$"+payment.totalPrice;
        totalPaid.textContent = "$"+payment.paidAmount
        duePayment.textContent = new Date(payment.duePayment).toLocaleDateString(); 
        fullyPaid.textContent  = (function() {
            if(payment.fullyPaid){
                return "Yes"
            }
            else{
                return "No"
            }
        })(); 


        const editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.onclick = function(){
            openModal('editmodal')
            document.getElementById('editPaymentDue').value = new Date(payment.duePayment).toISOString().split('T')[0]; 
            document.getElementById('editTotalCharge').value = payment.totalPrice
            document.getElementById('editPaid').value = payment.paidAmount

            document.getElementById('editPayment').onclick = function(){
                alert('editing payment')

                const editPaymentData = {
                    paymentDue : document.getElementById('editPaymentDue').value,
                    totalCharge: parseFloat(document.getElementById('editTotalCharge').value),
                    paid: parseFloat(document.getElementById('editPaid').value),
                    paymentId:payment.paymentId 
                }

                fetch('/editpayment', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(editPaymentData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.message === 'success') {
                        alert('Payment successfully edited');
                        location.reload(); // Optionally reload the page to reflect changes
                    } 
                    else {
                        alert('Logical Error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error with the request');
                });
            }
        }

        actions.appendChild(editButton);



    })
})
.catch( error =>{
    alert("error getting payments")
    console.log(error)
}
)



fetch('/getupcomingappts',{
    method: 'GET',
    })
    .then(response => response.json())  // Parsing the JSON response
    .then(data => {
        console.log(data)

        const apptsDropdown = document.getElementById('appts');


        const customerDropdown = document.getElementById('customers');

        data.forEach(appointment => {
            const option = document.createElement('option');


            // Parse and format date
            const appointmentDate = new Date(appointment.date); // Parse the ISO string
            const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });


            // Parse and format time
            const [hours, minutes] = appointment.time.split(':');
            const formattedTime = new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });

            option.value = appointment.appointmentId; // Use unique ID as the value
            option.textContent = `${appointment.customerName} - ${formattedDate} (${appointment.serviceName})`;
            
            
            
            apptsDropdown.appendChild(option);

            const customerOption = document.createElement('option');


            customerOption.value = appointment.customerId
            
            customerOption.textContent = appointment.customerName;

            customerDropdown.appendChild(customerOption)
        
            
            apptsDropdown.addEventListener('change',function(){
                document.getElementById('paymentInfo').style.display='block'
                
                document.getElementById('addCost').innerHTML = `Items Additional Cost: $${appointment.itemsCost}`
                customerDropdown.value=appointment.customerId
                customerDropdown.disabled = true;



                paymentDue = document.getElementById('paymentDue')
                charge = document.getElementById('charge')
                paid = document.getElementById('paid')

                document.getElementById('addNewPayment').onclick = function(){
                    alert('adding new payment')
                    if (!paymentDue || !charge || !paid){
                        alert('Fill out everything!')
                        return
                    }
                    alert(customerOption.value)

                    paymentData = {
                        apptId: parseInt(apptsDropdown.value),
                        customerId:parseInt(customerDropdown.value),
                        paymentDue:paymentDue.value,
                        charge:parseFloat(charge.value),
                        paid:parseFloat(paid.value)
                    }
                    console.log(paymentData)

                    fetch('/addnewpayment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(paymentData),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(data)
                        if (data.message=='success'){
                            alert("payment added")
                            location.reload()
                        }
                        else if(data.message=='out of stock'){
                            alert(data.items + " out of stock!")

                        }
                        else{
                            alert('logical error')
                        }

                    })
                    .catch(error => {
                        console.error('Error adding new payment:', error);
                        alert('Failed to add payment. Please try again.');
                    });
                    


                }
            }
                

        )
        

        });


    })
    .catch(error =>{
        console.log(error)

    })
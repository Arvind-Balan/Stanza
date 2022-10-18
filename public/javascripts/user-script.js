

function removeFromCart(productId){
    $.ajax({
        url:'/remove-from-cart/'+productId,
        method:'get',
        success:(response)=>{
            swal("Item removed from cart", "", "success");
            setTimeout(() => {
                location.reload()
            }, 800);
            

        }
    })

}

//WISHLIST
function addToWishlist(pdtId){
    $.ajax({
        url:'/add-to-wishList/'+pdtId,
        method:'get',
        success:(response)=>{
            console.log(response)

            if(response.added){
                swal({title:"Item added to wishlist", 
                 icon:"success",
                 button:false,
                 timer:1000

                });
            }
            else if(response.removed){
              swal({title:"Item removed from wishlist", 
              icon:"warning",
              button:false,
              timer:1000

             });
            }
        },error:(err)=>{
            swal("Something went wrong", "", "warning");
        }
    })
  }
  function removeFromwishList(pdtId){

    axios.post(`/wishlist/${pdtId}`,{}).then(response=>{
      swal("Item removed from wishlist", "", "warning").then(e=>{
        location.reload()
      })
    })
    }




//ADD ADDRESS
function addAddress(){
    fullName = document.getElementById('fullName').value
    mobile = document.getElementById("mobile").value
    building = document.getElementById('building').value
    landmark = document.getElementById('landmark').value
    // location = document.getElementById('location').value
    building = document.getElementById('building').value
    pincode = document.getElementById('pincode').value
    axios({
        url: '/addAddress',
        method: 'post',
        data:{
            fullName:fullName,
            mobile:mobile,
            building:building,
            location:location,
            building:building,
            pincode:pincode
        }
    })
}

function AddAddress(){
    fullName = document.getElementById('fullName').value
    mobile = document.getElementById("mobile").value
    building = document.getElementById('building').value
    landmark = document.getElementById('landmark').value
    // location = document.getElementById('location').value
    building = document.getElementById('building').value
    pincode = document.getElementById('pincode').value
    axios({
        url: '/add-address-from-co',
        method: 'post',
        data:{
            fullName:fullName,
            mobile:mobile,
            building:building,
            location:location,
            building:building,
            pincode:pincode
        },
        success:(response)=>{
            location.href = '/toCheckout'
        }
    })
}


function selectAddress(id){
   document.getElementById('selectedAddress').value = id
    console.log(id)
    document.getElementById("addressId").value = id
}


function placeOrder(){
     subtotal = document.getElementById('Subtotal').value
    totalCost = document.getElementById('finalCost').innerHTML
    addressId = document.getElementById('addressId').value
    discount = document.getElementById('discountAmt').innerHTML
    coupon = document.getElementById('coupon').value
   paymentMethod = document.getElementById('paymentMethod').value
    console.log(totalCost,addressId,discount,paymentMethod)
    if(addressId==''){
        swal("Select an address", "", "warning");
    }else
    $.ajax({
        url:'/place-order',
        method:'POST',
        data:{
            coupon:coupon,
          totalCost:subtotal,
         finalCost:totalCost,
         address:addressId,
        discount:discount,
        paymentMethod:paymentMethod,

        },
        success:(data)=>{
          console.log(data)
            if(data.response.orderSuccess){
            location.assign(`/ordersuccess/${data.response.data._id}`)
            }
            
            if(data.response.razorpay)
         
            {
              console.log(data)
              const options = {
                  "key": "rzp_test_o4KJQK1vvUOfj3", // Enter the Key ID generated from the Dashboard
                  "amount": data.response.data.finalCost*100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                  "currency": "INR",
                  "name": "Acme Corp",
                  "description": "Test Transaction",
                  "image": "https://example.com/your_logo",
                  "order_id": data.order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                  "handler": function (response){
                    location.assign(`/ordersuccess/${data.response.data._id}`)
                  },
                  "modal": {
                    "ondismiss": function () {
                      axios.post('/place-order',{
                        orderID:data.response.data._id,
                        failed:true
                      }).then(e=>{
                        console.log(e)
                        swal(e.data.message)
                      })
                    }
                  },
                  "prefill": {
                      "name": "Gaurav Kumar",
                      "email": "gaurav.kumar@example.com",
                      "contact": "9999999999"
                  },
                  "notes": {
                      "address": "Razorpay Corporate Office"
                  },
                  "theme": {
                      "color": "#3399cc"
                  }
              };
              var rzp1 = new Razorpay(options);
              rzp1.on('payment.failed', function (response){
                console.log('error')
                   
              });
            
                  rzp1.open();
             
      
              
            
            }
        }
    })
}


function razorpayPayment(data)
{

    console.log(data._id,data.totalCost)
 
    let options = {
      'key': "rzp_test_scEepl97MNpDhh" , // Enter the Key ID generated from the Dashboard
      'amount': data.totalCost, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      'currency': "INR",
      'name': "Stanza",
      'description': "Transaction",
      'image': "https://example.com/your_logo",
      'order_id': "" + data._id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
     
      'handler': function (response) {
        console.log('helllllllllllllooooooooooo')
        // alert(response.razorpay_order_id);
      //   alert(response.razorpay_signature);
        verifyPayment(response, order);
      },
      'prefill': {
        'name': "Test name",
        'email': "test@email.com",
        'contact': "9999999999",
      },
      'notes': {
        'address': "Razorpay Corporate Office",
      },
      'theme': {
        'color': "#3399cc",
      },
    };
  
    let rzp1 = new Razorpay(options);
    rzp1.open();
  
    function verifyPayment(payment, order) {
      // console.log('verifyyyyyyyyyy',payment)
      // console.log('verifyyyyyyyyyy',order)
      $.ajax({
        url: "/verify-payment",
        method: "post",
        data: {
          payment,
          order
        },success:(response)=>{
          if(response.status){
            setTimeout(() => {
              location.href = '/ordersuccess/'+order.receipt
            }, 800);
          }else{
            console.log("response.order",order.receipt)
            $.ajax({
              url: '/paymentfailed/'+response.orderID,
              method: 'get',
              success:(response)=>{
                // location.href = '/paymentfailed'
                // alert('payment       failed');
              },error:(err)=>{
                //handle error
              }
            })
          }
        },error:(err)=>{
          console.log(err);
        }
      });
    }
  
    rzp1.on("payment.failed", function (response) {
      $.ajax({
        url: '/paymentfailed/'+response.receipt,
        method: 'get',
        success:(response)=>{
          // location.href = '/paymentfailed'
          // console.log('payment       failed');
          // alert('payment       failed');
        }
      })
  
      // alert(response.error.code);
      // alert(response.error.description);
      // alert(response.error.source);
      // alert(response.error.step);
      // alert(response.error.reason);
      // alert(response.error.metadata.order_id);
      // alert(response.error.metadata.payment_id);
    });
  }






//APPLY COUPON
function applyCoupon() {
    couponCode = document.getElementById("coupon").value;
    amount = document.getElementById("Subtotal").value;
    console.log(couponCode);
    $.ajax({
      url: "/apply-coupon",
      method: "post",
      data: {
        coupon: couponCode,
        amount: amount,
      },
      success: (response) => {
        console.log(response);
        if (response.status) {
          swal("Coupon applied!", "", "success");
          document.getElementById("discount").value = response.discount;
          document.getElementById("discountAmt").innerHTML = response.discount;
          document.getElementById("finalCost").innerHTML = response.finalAmount;
          document.getElementById("final-cost").value = response.finalAmount;
        } else {
          swal("Enter a valid coupon code!", "", "warning");
        }
      },
    });
  }

  //CANCEL ORDER
function cancelOrder(orderID){
    swal({
        title: "Are you sure?",
        text: "Do you really want to cancel the order?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willRemove) => {
        if (willRemove) {
          $.ajax({
            url: "/cancel-order/" + orderID,
            method: "get",
            success: (response) => {
              // $("#addresses").load(location.href + " #addresses");
              // location.reload();
              location.href = '/view-orders'
            },
          });
        }
      });
}

//CANCEL ORDER FROM VIEW ORDERS PAGE
function CancelOrder(orderID){
  swal({
      title: "Are you sure?",
      text: "Do you really want to cancel the order?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willRemove) => {
      if (willRemove) {
        $.ajax({
          url: "/cancel-order/" + orderID,
          method: "get",
          success: (response) => {
            $("#orders").load(location.href + " #orders");
            // location.reload();
            // location.href = '/view-orders'
          },
        });
      }
    });
}
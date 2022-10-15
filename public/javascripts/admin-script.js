//ADD COUPON
function addCoupon() {
    name = document.getElementById('name').value
    discount = document.getElementById('discount').value
    code = document.getElementById('code').value
    console.log(name, discount, code)
    if (!name == "" || !discount == "" || !code == "") {
        $.ajax({
            url: '/admin/added-coupon',
            method: 'post',
            data: {
                name: name,
                discount: discount,
                code: code
            },
            success: (response) => {
                // setTimeout(() => {
                swal("Coupon added successfully", "", "success");
                // },800);
            },
            error: (err) => {
                // setTimeout(() => {
                swal("Something went wrong", "", "warning");
                // },800);
            }
        })
    }
}

//DELETE COUPON
function deleteCoupon(ID){
    swal({
        title: "Are you sure?",
        text: "Do you really want to delete this coupon?",
        icon: "warning",
        buttons: true,
        dangerMode: true, 
      })
      .then((willRemove) => {
        if (willRemove) {
            $.ajax({
            url:'/admin/delete-coupon/'+ID,
            method:'get',
            success:(response)=>{
                swal("Coupon deleted!", "", "success");
                 $("#coupons").load(location.href + " #coupons"); 
            }
        })
        }
      });
}

//UPDATE COUPON
function updateCoupon(ID){
 
   let Name = document.getElementById('name').value
   let code = document.getElementById('code').value
   let discount = document.getElementById('discount').value
    
 if(!Name==''||!code==''||!discount==''){
    $.ajax({
        url: '/admin/update-coupon/'+ID,
        method: 'post',
        data: {
            name:Name,
            code:code,
            discount:discount
        },success:(response)=>{
            // setTimeout(() => {
                swal("Coupon edited successfully", "", "success");
            // }, 800);
           
        },error:(err)=>{
            swal("Something went wrong! Try again.", "", "warning");
        }
    })
 }
}


//PACK ORDERS
function packOrder(orderID){
    console.log('helloooo');
    $.ajax({
        url:'/admin/pack-order/'+orderID,
        method:'get',
        success:(response)=>{
            $("#Orders").load(location.href + " #Orders"); 
        },error:(err)=>{
            console.log(err);
        }
    })
}

//SHIP ORDERS
function shipOrder(orderID){
    $.ajax({
        url:'/admin/ship-order/'+orderID,
        method:'get',
        success:(response)=>{
            $("#Orders").load(location.href + " #Orders"); 
        },error:(err)=>{
            console.log(err);
        }
    })
}

//dekiver ORDERS
function deliverOrder(orderID,userID){
    $.ajax({
        url:'/admin/deliver-order/'+orderID+'/'+userID,
        method:'get',
        success:(response)=>{
            $("#Orders").load(location.href + " #Orders"); 
        },error:(err)=>{
            console.log(err);
        }
    })
}
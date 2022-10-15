const Order = require("../models/order-schema")
const razorpay= require('razorpay')
const Cart = require("../models/cart-schema")
const userSchema = require('../models/user-schema')
const userhelpers = require("../helpers/userhelpers")
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.razorPayid,
  key_secret: process.env.razorPaysecret,
});

module.exports={
    placeOrder:async(req,res,next)=>{

        if(req.body.failed){
            await Order.findByIdAndDelete(req.body.orderID)
            return res.json({message:'oops .. ! ,something went wrong ...!'})
        }
    //   await userSchema.findOneAndUpdate({_id:req.session.user._id},{$pull:{coupons:{coupon:req.body.coupon}}})
const products = await  Cart.findOne({userId:req.session.user._id},"products")

req.body.products = products.products;
req.body.userId = req.session.user._id;
req.body.paymentStatus = req.body.paymentMethod === "Cash on Delivery" ? "In Progress" : "Pending";
let date = new Date();
date = date.toUTCString();
req.body.date = date.slice(5,16)
 let data =  await Order.create(req.body)
let response={data:data
}
if(req.body.paymentMethod==="Cash on Delivery"){
    response.orderSuccess = true
 res.json({response})
    }
    else{

const options = {
  amount: data.finalCost*100,  // amount in the smallest currency unit
  currency: "INR",
  receipt: "order_rcptid_11"
};
instance.orders.create(options, function(err, order) {
    console.log(order)
    response.razorpay=true
    res.json({response,order})
});
    }
  
},




 viewSuccessPage:async(req,res,next)=>{
    try {
        await Cart.findOneAndDelete({userId:req.session.user._id})
        res.render('users/ordersuccess',{user:true,login:true})
    } catch (error) {
        
    }
    }


}
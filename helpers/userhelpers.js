const userschema=require('../models/user-schema')
const adminSchema=require('../models/admin-schema')
const orders=require('../models/order-schema')
const couponSchema=require('../models/coupon-schema')

const bcrypt=require('bcrypt')

module.exports={
    signUp:(data)=>{
        return new Promise(async (resolve,reject)=>{
            const response = {}
            const userExist = await userschema.findOne({$or:[{email:data.email},{phoneNumber:data.phoneNumber}]})
            if(userExist){
                response.userExist=true;
                resolve(response)
            }
            else{
                data.password = await bcrypt.hash(data.password,10)
                console.log(data)






                const newUser = new userschema(data)
                newUser.save().then(async(RESPONSE)=>{

                    const couponCount = await couponSchema.countDocuments();
                    function random() {
                        const num = Math.floor(Math.random() * couponCount);
                        return num;
                      }
                      const randomDoc = random(couponCount);
                      couponSchema
                        .findOne()
                        .skip(randomDoc)
                        .exec(async (err, result) => {
                          console.log("heyy", result);
                          if(result){
                            await userschema.updateOne(
                              { phoneNumber: data.phoneNumber },
                              { $push: { coupons: { coupon: result._id } } }
                            );
                          }
                        });
response.user=newUser
                    response.phoneNumber=data.phoneNumber;
              resolve(response)
                })
            }

        })
    },


    doLogin:(data)=>{
      
        return new Promise(async(resolve,reject)=>{
          try {
            const response={}
            const isEmailExist= await userschema.findOne({email:data.email});
            if(isEmailExist){
                bcrypt.compare(data.password,isEmailExist.password).then((status)=>{
                    if (status){
                        //console.log("login success");
                        response.user=isEmailExist
                        response.status=true
                        resolve(response)
                    }else{
                       // console.log("login failed")
                        resolve(response)
                    }
                })
            }else{
               // console.log("login failed")
                resolve(response)
            }
          } catch (error) {
            reject(error)
          }
          

        })

    },
    addAddress:(data,id)=>{
        console.log('DAAATAAAAAA',data,id)
        return new Promise(async(resolve,reject)=>{
            const user = await userschema.findByIdAndUpdate({_id:id},{$push:{addresses:data}})
            console.log('user',user)
            resolve(true)
        })
    },
    getOrders: (userID) => {
        return new Promise(async (resolve, reject) => {
          try {
            const data = await orders
              .find({ userId: userID })
              .sort({ createdAt: -1 })
              .populate("products.items")
              .lean();
            resolve(data);
          } catch (error) {
            reject(error);
          }
        });
      },



//APPLY COUPON
applyCoupon: (coupon, amount, userID) => {
    console.log("APPLYCOUPON",coupon,amount,userID)
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        let status;
        let couponData;
        const userData = await userschema
          .findOne({ _id: userID })
          .populate("coupons.coupon")
          .lean();
        for (var i = 0; i < userData.coupons.length; i++) {
          if (userData.coupons[i].coupon.code === coupon) {
            status = true;
            couponData = userData.coupons[i].coupon;
            break;
          }
        }
        console.log("COUPON DATA",couponData)
        if (status) {
          let discount = (amount * couponData.discount) / 100;
          response.status = true;
          response.finalAmount = amount-discount;
          response.discount = discount;
          console.log("RESPONSE",response)
          resolve(response);
        } else {
          response.status = false;
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  cancelOrder: (orderID) => {
   // console.log("OrderID:",orderID)
    return new Promise(async (resolve, reject) => {
      try {
        await orders.findByIdAndDelete(orderID);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  orderInDetail: (orderID, addressID, userID) => {
    const response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const orderData = await orders
          .findById(orderID)
          .populate({path:'products',populate:"items"})
          .lean();
        const userData = await userschema.findById(userID).lean();
        let address;
        for (let i = 0; i < userData.addresses.length; i++) {
          if (addressID == userData.addresses[i]._id) {
            address = userData.addresses[i];
            break;
          }
        }
        response.orderData = orderData;
        response.address = address;
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  },

 //GENERATE RAZORPAY
 generateRazorpay: (orderID, amount) => {
  return new Promise((resolve, reject) => {
    try {
      orderID = orderID.toString();
      const Amount = parseInt(amount);
      const options = {
        amount: Amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: orderID,
        // ''+orderID
      };
      instance.orders.create(options, function (err, order) {
        if (order) {
          console.log("NEW ORDER");
          resolve(order);
        } else {
          console.log("ERROR", err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
},

//VERIFY PAYMENT
verifyPayment: (details) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('veriyPAYMENT')
      const crypto = require("crypto");
      let expectedSignature = crypto.createHmac(
        "sha256",
        process.env.RAZ_SECRET
      );
      expectedSignature.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      expectedSignature = expectedSignature.digest("hex");
      if (expectedSignature == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    } catch (err) {
      reject(err);
    }
  });
},

//CHANGE PAYMENT STATUS
changePaymentStatus: (orderID) => {
  return new Promise(async (resolve, reject) => {
    try {
      await orders
        .updateOne({ _id: orderID }, { $set: { paymentStatus: "Confirmed" } })
        .then((response) => {
          resolve(response);
        });
    } catch (err) {
      reject(err);
    }
  });
},



    // checkLogin:async(data)=>{
    //     let response = {};
    //     try {
    //         let isEmailExist = await userschema.find({email : data.email});
    //         if(isEmailExist){
    //             let isPasswordMatching = await userschema.find({password : data.email});
    //             if(isPasswordMatching){
    //                 response.returnStatus = true;
    //             response.message = "login successfull";
    //             return response
    //             }
                
    //         }
    //         else{
    //             response.returnStatus = false;
    //             response.message = "Invalid email id or password";
    //             return response
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
       
    // }
}
const userschema = require('../models/user-schema')
const adminSchema = require('../models/admin-schema')
const categorySchema = require('../models/category-schema')
const bcrypt = require('bcrypt')
const couponSchema=require('../models/coupon-schema')
const orders = require('../models/order-schema')

module.exports = {
    doLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            const response = {}
            const isEmailExist = await adminSchema.findOne({ email: data.email });
            if (isEmailExist) {
                bcrypt.compare(data.pswd,isEmailExist.password).then((status) => {
                // console.log(status);
                  if (status) {
                        //console.log("login success");
                        response.admin = isEmailExist
                        response.status = true
                        resolve(response)
                    } else {
                        // console.log("login failed")
                        resolve(response)
                    }
                })
            } else {
                // console.log("login failed")
                resolve(response)
            }
        })
    },

    //block user
    blockUser:(userID)=>{
        console.log(userID);
        return new Promise(async(resolve,reject)=>{
        const user = await userschema.findOne({_id:userID})
        if(user.isActive){
          await userschema.updateOne({_id:user._id},{isActive:false})
          resolve(user.isActive)
        }
        else{
          resolve(user.isActive)
        }
        })
      },
    
      // UNBLOCK USER
      unblockUser:(userID)=>{
        return new Promise(async(resolve,reject)=>{
          const user = await userschema.findOne({_id:userID})
          if(user.isActive){
            resolve(user.isActive)
          }
          else{
            await userschema.updateOne({_id:user._id},{isActive:true})
            resolve(user.isActive)
          }
        })
      },



      // ADD CATEGORY
  addCategory:(data)=>{
    return new Promise (async(resolve,reject)=>{
      const categoryExist = await categorySchema.findOne({name:data.name})
      if(categoryExist){
        const response = false;
        resolve(response)
      }else{
        const newCategory = new categorySchema(data);
        console.log(newCategory);
        newCategory.save().then((response)=>{
          resolve(response)
        })
      }
    })
  },










































  
  // GET CATEGORY DATA TO EDIT CATEGORY PAGE
  editCategory:(ID)=>{
    return new Promise(async(resolve,reject)=>{
      const categoryData = await categories.findById({_id:ID})
      console.log(categoryData);
      resolve(categoryData)
    })
  },

  //UPDATE EDITED CATEGORY DATA TO DATABASE
  updateCategory:(ID,editedData)=>{
    return new Promise ((res,rej)=>{
      categories.updateOne({_id:ID},{$set:{
        name:editedData.name
      }}).then((response)=>{
        res(response)
      })
    })
  },

  //DELETE CATEGORY
  deleteCategory:(ID)=>{
    return new Promise((resolve,reject)=>{
      categories.deleteOne({_id:ID}).then((result)=>{
        resolve(result)
      })
    })
  },

  getCoupons: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const Coupons = await couponSchema.find().lean();
        resolve(Coupons);
      } catch (err) {
        reject(err);
      }
    });
  },
  //ADD COUPON
  addCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(data)
        const couponExist = await couponSchema.findOne({ name: data.name });
        if (couponExist) {
          const response = false;
          resolve(response);
        } else {
          data.name = data.name.toUpperCase();
          data.code = data.code.toUpperCase();
          const newCoupon = new couponSchema(data);
          newCoupon.save().then(() => {
            resolve(true);
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  //DELETE COUPON
  deleteCoupon: (ID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await couponSchema.deleteOne({ _id: ID });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },
  //EDIT COUPON
  editCoupon: (couponID) => {
    return new Promise(async (resolve, reject) => {
      try {
        const coupon = await couponSchema.findOne({ _id: couponID }).lean();
        resolve(coupon);
      } catch (error) {
        reject(error);
      }
    });
  },
 //UPDATE COUPON
 updateCoupon: (ID, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(ID,data)
      data.name = data.name.toUpperCase();
      data.code = data.code.toUpperCase();
      await couponSchema.findByIdAndUpdate(
        { _id: ID },
        {
          $set: {
            name: data.name,
            discount: data.discount,
            code: data.code,
          },
        }
      );
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
},

  //PACK ORDERS
  packOrder: (orderID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders.updateOne(
          { _id: orderID },
          { $set: { orderStatus: "Packed" } }
        );
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  //PACK ORDERS
  shipOrder: (orderID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders.updateOne(
          { _id: orderID },
          { $set: { orderStatus: "Shipped" } }
        );
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },

  //PACK ORDERS
  deliverOrder: (orderId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orders.updateOne(
          { _id: orderId },
          { $set: { orderStatus: "Delivered", paymentStatus: "Confirmed" } }
        );
        const couponCount = await couponSchema.countDocuments();
        function random() {
          const num = Math.floor(Math.random() * couponCount);
          return num;
        }
        const randomDoc = random();

        couponSchema
          .findOne()
          .skip(randomDoc)
          .exec(async (err, result) => {
            if(result){
              await userschema.updateOne(
                { _id: userId },
                { $push: { coupons: { coupon: result._id } } }
            ).then((response)=>{
              console.log("response",response)
            })
            }
          });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  },
}



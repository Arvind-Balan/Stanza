const productSchema = require('../models/product-schema')
const multer = require('multer');
const product = require('../models/product-schema');
const cartSchema = require('../models/cart-schema');
const { products, cart } = require('../config/collections');
const { default: mongoose } = require('mongoose');
const wishListHelper=require('../helpers/wishListHelper')
const wishListSchema=require('../models/wishList-schema')


exports.getWishlistItems=(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let userData= await wishListSchema.findOne({userId:userId}).populate('products.items').lean()
    resolve(userData)
  }) 
}


// module.exports={
//   addingToWishList:(productId,userId)=>{
//     const response={};
//     return new Promise(async(resolve,reject)=>{
//       try{
//         const alreadyInWishList= await wishListSchema.findOne({
//           userId:userId,
//           "products.items": productId,
//         });
//         if(alreadyInWishList){
//           await wishListSchema.findOneAndUpdate(
//             {userId:userId},
//             {$pull:{products:{items:productId}}}
//           );
//           response.removed=true;
//           resolve(response);
//         }else{
//           const user=await wishListSchema.findOne({userId:userId});
//           const product={
//             productId:productId,
//           };
//           await 
//           // user.products.push(product);
//           user.save().then(()=>{
//             resolve(response)
//           });
//         }
//       }catch(err){
//         reject(err);
//       }
//     });
//   },


// //remove from wishlist

// removeWishlistItem: (productID, userID) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       await wishListSchema
//         .findByIdAndUpdate(
//           { userId: userId },
//           { $pull: { products: { productId: productId } } }
//         )
//         .then((res) => {
//           resolve(res);
//         })
//         .catch((err) => {
//           reject(err);
//         });
//     } catch (err) {
//       reject(err);
//     }
//   });
// },
// };










//adding to wishlist

exports.
addingToWishList=(proId,userId)=>{

    return new Promise(async(resolve,reject)=>{
      const response = {}
      let userWishList= await wishListSchema.findOne({userId:userId})
      //console.log(userWishList);
      if(userWishList){
        // console.log(mongoose.Types.ObjectId(proId));
        //  let exist=userWishList.products.filter((value)=>{ value.items== mongoose.Types.ObjectId(proId)})
         let wishlistProduct = await wishListSchema.findOne({
            userId: userId,
            "products.items": proId,
          });
       // console.log(exist);
         if(wishlistProduct)
         {
            await wishListSchema.findOneAndUpdate(
                {
                  userId: userId,
                },
                {
                  $pull: {
                    products: {items: proId,
                  }
                }}
              )
              response.removed = true;
              resolve(response)
         }
         else{
      //  let item ={
      //    items:proId,
      //    quantity:1
      //  }
       wishListSchema.findOneAndUpdate(
            { userId: mongoose.Types.ObjectId(userId) },
            { $push: { products:{
              items:proId
            }}
              } ).then((doc) => {
            console.log("dk");
            response.added = true;
              resolve(response)
          });
        }
      }

      else{
        let wishlistData= new wishListSchema({
            userId:userId,
            products:{
                items:proId
            }
        })
        wishlistData.save().then((response)=>{
          response.added = true;
          resolve(response)
        })
        

      }
    })
  }



//  exports.getCartCount=(userId)=>{
//     return new Promise(async(resolve,reject)=>{
//       let count=0
//       let cart=await cartSchema.findOne({userId:userId})
//       if(cart){
//         count=cart.products.length
//       }
//       resolve(count)
//     })
//   }

 




  //CART ITEMS COUNT
  // exports.wishListItmsCount=(userID)=>{
  //   return new Promise(async(resolve,reject)=>{
  //     const userData = await wishListSchema.findOne({userId:userID})
  //     // console.log(userData);
  //     const count = userData.products.length;
  //     // console.log(count);
  //     resolve(count);
  //   })
  // }
  

  exports.removeWishlistItem=(userId,productId)=>{
    return new Promise(async(resolve,reject)=>{
      try {
        console.log('haaaaaai');
        await wishListSchema.updateOne({userId:userId},{$pull:{products:{items:productId}}})
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
  
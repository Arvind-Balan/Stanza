const productSchema = require('../models/product-schema')
const multer = require('multer');
const product = require('../models/product-schema');
const cartSchema = require('../models/cart-schema');
const { products, cart } = require('../config/collections');
const { default: mongoose } = require('mongoose');



//adding to cart

exports.addingToCart = (proId, userId) => {
  return new Promise(async (resolve, reject) => {

    /////////////////if user&cart exists //////////////////////

    let userCart = await cartSchema.findOne({ userId: userId })
    //console.log(userCart);
    if (userCart) {
      // console.log(mongoose.Types.ObjectId(proId));
      //  let exist=userCart.products.filter((value)=>{ value.items== mongoose.Types.ObjectId(proId)})

      let cartproduct = await cartSchema.findOne({
        userId: userId,
        "products.items": proId,
      });
      // console.log(exist);
      if (cartproduct) {
        await cartSchema.findOneAndUpdate(
          {
            userId: userId,
            "products.items": proId,
          },
          {
            $inc: {
              "products.$.quantity": 1
            },
          }
        )
        resolve()
      }
      else if (!cartproduct) {
        let item = {
          items: proId,
          quantity: 1
        }
        cartSchema.findOneAndUpdate(
          { userId: mongoose.Types.ObjectId(userId) },
          {
            $push: { products: item }
          }).then((doc) => {
            console.log("dk");
            resolve()
          });
      }
    } else {

      ///////////////////adding the new cart 

      let cartObj = new cartSchema({
        userId: userId,
        products: {
          items: proId,
          quantity: 1.
        }
      })
      cartObj.save().then((response) => {
        resolve()
      })


    }
  })
}



exports.getCartCount = (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0
    let cart = await cartSchema.findOne({ userId: userId })
    if (cart) {
      count = cart.products.length
    }
    resolve(count)
  })
}






//CART ITEMS COUNT
exports.cartItemsCount = (userID) => {
  return new Promise(async (resolve, reject) => {
    const userData = await cartSchema.findOne({ userId: userID })
    // console.log(userData);
    if (userData) {
      const count = userData.products.length;
      resolve(count);
    }
    resolve()
    // console.log(count);

  })
}

//REMOVE FROM CART
exports.removeFromCart = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('haaaaaai');
      await cartSchema.updateOne({ userId: userId }, { $pull: { products: { items: productId } } })
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}


exports.changeQuantity = (data,userId) => {

  const pdtId = data.pdtId
  const count = parseInt(data.count)
  return new Promise(async (resolve, reject) => {
    console.log('quantity')
    await cartSchema.updateOne({ userId: userId, "products.items": pdtId }, { $inc: { "products.$.quantity": count } })
    const cart = await cartSchema.findOne({ userId: userId }).populate("products.items")
    let sum = 0;
    const total = cart.products.map((val) => {
      sum = val.items.sellingPrice * val.quantity
      // sum +=  val.items.sellingPrice * val.quantity
      return sum
    })
    let x
    const TotalAmount = total.reduce((prev, curr) => {
      return prev += curr

    })
    console.log(total, TotalAmount)
    resolve(TotalAmount)
  })
}
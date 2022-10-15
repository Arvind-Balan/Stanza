const multer = require('multer')
const categoriesModel = require('../models/category-schema')
const productHelper = require('../helpers/productHelpers')
const fs = require('fs')
const product = require('../models/product-schema')
const cart = require('../models/cart-schema')
const { findOne } = require('../models/product-schema')
const cartHelper = require('../helpers/cartHelper')
const authentication = require('../middlewares/checkSession')

module.exports = {
  addToCart: async (req, res) => {
    console.log(req.params.id);
   
    await cartHelper.addingToCart(req.params.id, req.session.user._id).then(async () => {
      // let cartData = await cart.findOne({ userId: req.session.user._id }).populate("products.items").lean()
      // let products = cartData.products
     // res.render('users/cartPage', { products, userID: req.session.user, login: true })
     
     res.redirect('/goToCart')
    })
   
  },
  cartItmsCount: async (req, res) => {
    let count
    // console.log('hellooooooo');
    if (req.session.loggedIn) {
      await cartHelper.cartItemsCount(req.session.user._id).then((response) => {
        // console.log('hellooooooo');
        count = response;
        // console.log(count);
        res.json(count)
      })
        .catch((err) => {
          next(err)
        })
    }
  },
  removeFromCart:async(req,res,next)=>{
    console.log('helloooooooooo');
    await cartHelper.removeFromCart(req.session.user._id,req.params.id).then((response)=>{
      res.json(response)
    }).catch((err)=>{
      next(err)
    })
  },
  changeQuantity:(req,res)=>{
    console.log('helloooo')
    cartHelper.changeQuantity(req.body,req.session.user._id).then((response)=>{
      console.log('response')
      console.log(response)
      res.json(response)
    })
  },
  
checkout:(req,res)=>{
  cartHelper.cartItemsCount()
  res.render("users/checkOutPage",{login: true }) 
}
}

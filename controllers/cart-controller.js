const multer = require('multer')
const categoriesModel = require('../models/category-schema')
const productHelper = require('../helpers/productHelpers')
const fs = require('fs')
const product = require('../models/product-schema')
const cart = require('../models/cart-schema')
const { findOne } = require('../models/product-schema')
const cartHelper = require('../helpers/cartHelper')
const authentication = require('../middlewares/checkSession')
const createError = require('http-errors');

module.exports = {
  addToCart: async (req, res,next) => {
   try {
    await cartHelper.addingToCart(req.params.id, req.session.user._id).then(async () => {
      res.redirect('/goToCart')
     })
   } catch (error) {
    next(createError(404));
   }
   
  },
  cartItmsCount: async (req, res,next) => {
    try {
      let count
    if (req.session.loggedIn) {
      await cartHelper.cartItemsCount(req.session.user._id).then((response) => {      
        count = response;
        res.json(count)
      }) 
    }
    } catch (error) {
      next(createError(404));
    }
  },
  removeFromCart:async(req,res,next)=>{
    try {
      await cartHelper.removeFromCart(req.session.user._id,req.params.id).then((response)=>{
        res.json(response)
      })
    } catch (error) {
      next(createError(404));
    }
  },
  changeQuantity:(req,res,next)=>{
    try {
      cartHelper.changeQuantity(req.body,req.session.user._id).then((response)=>{
        res.json(response)
      })
    } catch (error) {
      next(createError(404));
    }
  },
  
checkout:(req,res,next)=>{
  try {
    cartHelper.cartItemsCount()
  res.render("users/checkOutPage",{login: true }) 
  } catch (error) {
    next(createError(404));
  }
}
}

const multer = require('multer')
const categoriesModel = require('../models/category-schema')
const productHelper = require('../helpers/productHelpers')
const fs = require('fs')
const product = require('../models/product-schema')
const cart = require('../models/cart-schema')
const wishListSchema=require('../models/wishList-schema')
const { findOne } = require('../models/product-schema')
const cartHelper = require('../helpers/cartHelper')
const wishListHelper=require('../helpers/wishListHelper')
const authentication = require('../middlewares/checkSession')
const { resolve } = require('path')
const createError = require('http-errors');

module.exports = {
    addToWishList: async (req, res) => {
   try {
    await wishListHelper.addingToWishList(req.params.id, req.session.user._id).then((response) => {
      res.json(response)
    })
   } catch (error) {
    next(createError(404));
   }

  },

  wishlistPage:async(req,res)=>{
    try {
      await wishListHelper.getWishlistItems(req.session.user._id).then((products)=>{
        const pro = products.products
        res.render('users/wishListPage',{pro,user:true,login:true})
      })
    
    } catch (error) {
      next(createError(404));
    }
  },


  wishListItemsCount: async (req, res) => {
    try {
      let count
    if (req.session.loggedIn) {
      await wishListHelper.wishListItmsCount(req.session.user._id).then((response) => {
        count = response;
        res.json(count)
      })
        
    }
    } catch (error) {
      next(createError(404));
    }
  },
  removeFromWishlist:async(req,res,next)=>{
   try {
    await wishListHelper.removeWishlistItem(req.session.user._id,req.params.id).then((response)=>{
      res.json(response)
    })
   } catch (error) {
    next(createError(404));
   }
  }
}
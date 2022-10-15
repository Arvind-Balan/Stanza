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

module.exports = {
    addToWishList: async (req, res) => {
    //console.log(req.params.id);

    await wishListHelper.addingToWishList(req.params.id, req.session.user._id).then((response) => {
      console.log(response)
      res.json(response)
    })

  },

  wishlistPage:async(req,res)=>{
    await wishListHelper.getWishlistItems(req.session.user._id).then((products)=>{
      const pro = products.products
      res.render('users/wishListPage',{pro,user:true,login:true})
    })
  
  },


  wishListItemsCount: async (req, res) => {
    let count
    // console.log('hellooooooo');
    if (req.session.loggedIn) {
      await wishListHelper.wishListItmsCount(req.session.user._id).then((response) => {
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
  removeFromWishlist:async(req,res,next)=>{
    console.log('helloooooooooo');
    await wishListHelper.removeWishlistItem(req.session.user._id,req.params.id).then((response)=>{
      res.json(response)
    }).catch((err)=>{
      next(err)
    })
  }
}
const multer = require('multer')
const categoriesModel = require('../models/category-schema')
// const Products = require("../models/product-schema")
const productHelper = require('../helpers/productHelpers')
const fs = require('fs')
const product = require('../models/product-schema')
const { findOne } = require('../models/product-schema')
const cartHelper = require('../helpers/cartHelper')

module.exports = {
    addProduct: async (req, res, next) => {
        const categories = await categoriesModel.find().lean()
        res.render("admin/add-product", { layout: 'adminLayout', categories })
    },

    AddProducts: function (req, res, next) {
        //console.log('haloo')
        const imgs = req.files;
        // console.log(req.body)
        let images = imgs.map((value) => value.filename)


        //console.log(images);
        req.body.images = images;
        productHelper.addProduct(req.body).then((result) => {

            res.redirect('/admin/products')
        })
            .catch((err) => {
                next(err)
            })
    },


    DeleteProduct: async (req, res) => {
        let productId = req.params.id
        const productData = await product.findById({ _id: productId })
        // console.log(productData);
        fs.unlinkSync(`public/images/products/${productData.images[0]}`)
        productHelper.deleteProduct(productId).then(() => {
            res.redirect('/admin/product-management')
        })
    },

    editProduct: async (req, res) => {
        var product = await productHelper.getProductDetails(req.params.id)
        const categories = await categoriesModel.find().lean()
        res.render('admin/edit-product', { product, categories, layout: 'adminLayout' })
    },

    updateProduct: async (req, res) => {
        const image = req.files
        const img = image.map((val) => {
            var value = val.filename
            return value
        })
        req.body.images = img
        const productData = await product.findById({ _id: req.params.id })
        if (productData.images[0]) {
            fs.unlinkSync(`public/images/products/${productData.images[0]}`)
        }
        await productHelper.updateProduct(req.params.id, req.body).then(() => {
            res.redirect('back')
        })
    },

    //to render the single product page with product id

    singleProductPage: async (req, res,next) => {
        let cartCount = null
        cartCount = await cartHelper.getCartCount(req.session.user._id)
        const products = await product.findOne({ _id: req.params.id }).lean()
        if(!products){
            next(new Error)
        }
        res.render("users/singleProductPage", { user: true, products, login: true, cartCount })

    }
}
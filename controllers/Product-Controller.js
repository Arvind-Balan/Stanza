const multer = require('multer')
const categoriesModel = require('../models/category-schema')
const createError = require('http-errors');
const productHelper = require('../helpers/productHelpers')
const fs = require('fs')
const product = require('../models/product-schema')
const { findOne } = require('../models/product-schema')
const cartHelper = require('../helpers/cartHelper')


module.exports = {
    addProduct: async (req, res, next) => {

        try {
            const categories = await categoriesModel.find().lean()
            res.render("admin/add-product", { layout: 'adminLayout', categories })
        } catch (error) {
            next(createError(404));
        }
    },

    AddProducts: function (req, res, next) {

        try {
            const imgs = req.files;
            let images = imgs.map((value) => value.filename)
            req.body.images = images;
            productHelper.addProduct(req.body).then((result) => {
                res.redirect('/admin/products')
            })
        } catch (error) {
            next(createError(404));
        }
    },


    DeleteProduct: async (req, res,next) => {
        try {
            let productId = req.params.id
        const productData = await product.findById({ _id: productId })
        fs.unlinkSync(`public/images/products/${productData.images[0]}`)
        productHelper.deleteProduct(productId).then(() => {
            res.redirect('/admin/product-management')
        })
        } catch (error) {
            next(createError(404)); 
        }
    },

    editProduct: async (req, res,next) => {
        try {
            var product = await productHelper.getProductDetails(req.params.id)
        const categories = await categoriesModel.find().lean()
        res.render('admin/edit-product', { product, categories, layout: 'adminLayout' })
        } catch (error) {
            next(createError(404)); 
        }
    },

    updateProduct: async (req, res,next) => {
        try {
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
        } catch (error) {
            next(createError(404)); 
        }
    },

    //to render the single product page with product id

    singleProductPage: async (req, res, next) => {
        try {
            let cartCount = null
        cartCount = await cartHelper.getCartCount(req.session.user._id)
        const products = await product.findOne({ _id: req.params.id }).lean()
        if (!products) {
            next(new Error)
        }
        res.render("users/singleProductPage", { user: true, products, login: true, cartCount })
        } catch (error) {
            next(createError(404)); 
        }

    }
}
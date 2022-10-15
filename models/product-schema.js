const collections = require('../config/collections')
const mongoose = require('mongoose')
const schema = mongoose.Schema;

const productDetails = new schema({
    name:{
        type: String,
         required: true
    },
    brand:{
        type: String,
         required: true
    },
    details:{
        type: String,
         required: true
    },
    description:{
        type: String,
         required: true
    },
    category:{
         type: mongoose.Schema.Types.ObjectId, ref:'category'
    },
    quantity:{
        type: Number,
        required: true,
        defalut: 0
    },
    actualPrice:{
        type: Number,
         required: true,
    },
    sellingPrice:{
        type: Number,
         required: true,
        default: 0
    },
    sold:{
        type: Number,
        default: 0
    },
    images:{
        type: Array,
         required: true
    }
},
    {timestamps:true}
)

const product = mongoose.model(collections.products,productDetails)

module.exports = product;
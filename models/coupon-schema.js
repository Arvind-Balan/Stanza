const mongoose = require('mongoose');
const collections = require('../config/collections')
const schema = mongoose.Schema;

const couponSchema = new schema({
    name:{
        type: String,
        // required: true
    },
    discount:{
        type: Number,
        // required: true,
    },
    code:{
        type: String,
        // required: true
    },
})

const coupon = mongoose.model(collections.coupons,couponSchema)

module.exports = coupon;
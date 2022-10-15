const mongoose = require('mongoose');
const userSchema = require('../models/user-schema')
const { NumberContext } = require('twilio/lib/rest/pricing/v2/number');
const collections = require('../config/collections')
const schema = mongoose.Schema;

const orderSchema = new schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId, ref:'users'
    },
    products:[{
        items:{
           type: mongoose.Types.ObjectId,
           ref:'products',
        },
        quantity:{
            type:Number
        }
    }],
    totalCost:{
        type: Number,
        default:0
    },
    coupon:{
        type: String
        // mongoose.Schema.Types.ObjectId, ref:('coupons')
    },
    discount:{
        type: Number,
        default:0
    },
    finalCost:{
        type: Number,
        default:0
    },
    paymentMethod:{
        type: String
    },
    address:{
        type: mongoose.Schema.Types.ObjectId, ref:('users')
    },
    paymentStatus:{
        type: String
    },
    orderStatus:{
        type: String,
        default: 'Placed'
    },
    date:{
        type: String
    }
},
{timestamps:true})

const orders = mongoose.model(collections.orders,orderSchema)

module.exports = orders;
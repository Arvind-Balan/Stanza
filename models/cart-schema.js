const mongoose=require('mongoose')
const collections=require('../config/collections')
const schema=mongoose.Schema


const cartData= new schema({
    userId:{
        type:mongoose.Types.ObjectId, ref:'user',
        required:true
    },
    products:[{
        items:{
           type: mongoose.Types.ObjectId,
           ref:'products',
        },
        quantity:{
            type:Number
        }
    }]
},
{timestamps:true})
    const category= mongoose.model(collections.cart,cartData)
    module.exports=category
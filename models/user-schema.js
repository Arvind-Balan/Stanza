const mongoose=require('mongoose')
const collections = require('../config/collections')
const schema = mongoose.Schema
const userdata=new schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required :true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    coupons:[{
        coupon:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'coupons',
        }
    }],
    addresses:[
        {
            fullName:{
                type:String
                // required:true
            },
            mobile:{
                type:Number
                // required:true
            },
            building:{
                type: String
                // required:true
            },
            landmark:{
                type:String
                // required:true
            },
            district:{
                type:String
                // required:true
            },
            // state:{
            //     type:String
            // }
            pincode:{
                type: Number
                // required:true
            }
        }
    ],
})
const user= mongoose.model(collections.users,userdata)
module.exports=user


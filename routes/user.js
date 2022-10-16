
var express = require('express');
const createError = require('http-errors');
const userSchema = require('../models/user-schema')
const userhelpers = require('../helpers/userhelpers');
const productSchema = require('../models/product-schema')
var router = express.Router();
const twilio = require('../utils/twilio')
const ProductController = require("../controllers/Product-Controller")
const cartController = require("../controllers/cart-controller")
const wishListController = require('../controllers/wishList-controller')
const auth = require('../middlewares/checkSession')
const cartHelper = require('../helpers/cartHelper')
const orderController = require("../controllers/order-controller")
const cartModel = require('../models/cart-schema');


/* GET home page. */
router.get('/', auth.activeCheck, async function (req, res, next) {
 
  try {
    const products = await productSchema.find().lean()
 
  let cartCount = null
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id)
  }
  
  if (req.session.loggedIn) {
    res.render('home', { user: true, login: true, products, cartCount })
  }
  else {
    res.render('home', { user: true, products });
  }
  } catch (error) {
    next(createError(404));
  }
});


//Get Login
router.get('/signIn', (req, res,next) => {
 try {
  if (req.session.loggedIn) {
    res.redirect('/')
  }
  else if (req.session.logginError) {
    res.render('users/login', { logginError: req.session.logginError })
    req.session.logginError = false
  }
  else {
    res.render('users/login')
  }
 } catch (error) {
  next(createError(404));
 }
})




//User Sign UP 
router.post('/signedIn', (req, res,next) => {
  try {
    userhelpers.signUp(req.body).then((response) => {
      if (response.userExist) {
        res.redirect('/signIn')
      }
      req.session.user = response.user
      req.session.phoneNumber = response.phoneNumber
      twilio.getOtp(response.phoneNumber)
      res.render('users/otp', { user: false })
    })
  } catch (error) {
    next(createError(404));
  }
})

//confirm otp
router.post('/confirm', (req, res,next) => {
  try {
  twilio.checkOtp(req.body.otp, req.session.phoneNumber).then((response) => {
    if (response.status) {
      userSchema.findOneAndUpdate({ phoneNumber: req.session.phoneNumber }, {
        isVerified: true
      }).then(() => {
        req.session.loggedIn = true
        res.redirect('/')
      })
    }
  })
} catch (error) {
  next(createError(404));
}
})





//logout
router.get('/logout', function (req, res, next) {
 try {
  req.session.destroy()
  res.redirect('/');
 } catch (error) {
  next(createError(404));
 }
});


// user login
router.post('/loggedIn', (req, res,next) => {
  try {
    userhelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
  
        req.session.user = response.user
  
        res.redirect('/')
      } else {
        req.session.logginError = true;
        res.redirect('/signIn')
      }
    })
  } catch (error) {
    next(createError(404));
  }
})


router.get('/guitars', auth.activeCheck, async (req, res,next) => {
  try {
    const products = await productSchema.find({ category: '6327f872fb8a5c676be1d654' }).lean()
  let cartCount = null
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id)
  }
  res.render("users/product", { products, guitars: true, cartCount })
  } catch (error) {
    next(createError(404));
  }
})

router.get("/keyboards", auth.activeCheck, async (req, res,next) => {
  try {
    const products = await productSchema.find({ category: '6327f961159be23925fbfbaa' }).lean()
  let cartCount = null
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id)
  }
  res.render("users/product", { products, keyboards: true, cartCount })
  } catch (error) {
    next(createError(404));
  }
})

router.get("/violins", auth.activeCheck, async (req, res,next) => {
  try {
    const products = await productSchema.find({ category: '6327f8a7c3f6b45fc422aa05' }).lean()
  let cartCount = null
  if (req.session.user) {
    cartCount = await cartHelper.getCartCount(req.session.user._id)
  }
  res.render("users/product", { products, violins: true, cartCount })
  } catch (error) {
    next(createError(404));
  }
})


router.get('/single-product-page/:id', auth.authentication, auth.activeCheck, ProductController.singleProductPage)


router.get('/add-to-cart/:id', auth.authentication, auth.activeCheck, cartController.addToCart)
router.get("/remove-from-cart/:id", auth.authentication, auth.activeCheck, cartController.removeFromCart)



router.get('/count', auth.authentication, cartController.cartItmsCount)


router.get('/add-to-wishList/:id', auth.authentication, auth.activeCheck, wishListController.addToWishList)
router.get('/wishlist', auth.authentication, auth.activeCheck, wishListController.wishlistPage)
router.post('/wishlist/:id', auth.authentication, auth.activeCheck, wishListController.removeFromWishlist)


/////////////cart functions/////////////////////////


router.get('/goToCart', auth.authentication, auth.activeCheck, async (req, res,next) => {
  try {
    let cartData = await cartModel.findOne({ userId: req.session.user._id }).populate("products.items").lean()

  let userID = req.session.user._id
  if (cartData) {
    let products = cartData.products
    let sum = 0
    const total = products.map((val) => {
      sum = val.items.sellingPrice * val.quantity
      return sum
    })
    console.log(total);
    const TotalAmount = total.reduce((prev, curr) => {
      return prev += curr

    }, 0)
    const user = await userSchema.findOne({ _id: req.session.user._id }).lean()
    coupons = user.coupons
    let cartCount = null
    cartCount = await cartHelper.getCartCount(req.session.user._id)
    res.render('users/cartPage', { products, userID, TotalAmount, user: true, login: true, coupons, cartCount })
  } else {
    res.render('users/cartPage', { userID, user: true, login: true })
  }
  } catch (error) {
    next(createError(404));
  }


})

router.post('/change-quantity', auth.authentication, cartController.changeQuantity)

router.get('/toCheckout', auth.authentication, auth.activeCheck, async (req, res,next) => {
  try {
    let cartData = await cartModel.findOne({ userId: req.session.user._id }).populate("products.items").lean()
  console.log(cartData)
  if (cartData.products.length < 1) return res.redirect('/')
  let products = cartData.products
  let sum = 0
  const total = products.map((val) => {
    sum = val.items.sellingPrice * val.quantity
    return sum
  })

  const TotalAmount = total.reduce((prev, curr) => {
    return prev += curr

  })
  const userId = req.session.user._id
  const user = await userSchema.findOne({ _id: userId }).populate({ path: 'coupons', populate: "coupon" }).lean()
  data = user.addresses
  const coupons = user.coupons
  let cartCount = null
  cartCount = await cartHelper.getCartCount(req.session.user._id)
  res.render("users/checkOutPage", { data, TotalAmount, user: true, login: true, coupons, cartCount })
  } catch (error) {
    next(createError(404));
  }
})




router.get('/add-address', auth.authentication, auth.activeCheck, (req, res,next) => {
  try {
    if (req.session.toCheckout) {
      const toCheckout = true
      res.render('users/addAddress', { toCheckout })
    }
    else {
      res.render('users/addAddress')
    }
  } catch (error) {
    next(createError(404));
  }
})

router.get('/add-address-from-co', auth.activeCheck, (req, res,next) => {
  try {
    req.session.toCheckout = true
  res.redirect('/add-address');
  req.session.toCheckout = false;
  } catch (error) {
    next(createError(404));
  }
})

router.post('/add-and-get-checkout', auth.authentication, auth.activeCheck, (req, res) => {
  try {
    userhelpers.addAddress(req.body, req.session.user._id).then((response) => {
      res.redirect('/toCheckout')
    })
  } catch (error) {
    next(createError(404));
  }
})
router.get('/ordersuccess/:id', auth.authentication, auth.activeCheck, orderController.viewSuccessPage)
router.post('/place-order', auth.authentication, auth.activeCheck, orderController.placeOrder)


router.get(
  "/view-orders",
  auth.authentication, auth.activeCheck,
  (req, res, next) => {
   try {
    userhelpers
    .getOrders(req.session.user._id)
    .then((orders) => {
      res.render("users/viewOrders", { orders, user: true, login: true });
    })
    .catch((err) => {
      next(err);
    });
   } catch (error) {
    next(createError(404));
   }
  }
);

//APPLY COUPON
router.post("/apply-coupon", (req, res, next) => {
  try {
    userhelpers
    .applyCoupon(req.body.coupon, req.body.amount, req.session.user._id)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
  } catch (error) {
    next(createError(404));
  }
});

router.get(
  "/cancel-order/:id",
  auth.authentication, auth.activeCheck,
  (req, res, next) => {
    try {
      userhelpers
      .cancelOrder(req.params.id, req.session.user._id)
      .then((response) => {
        res.json(response);
      });
    } catch (error) {
      next(createError(404));
    }
  }
);

// VIEW ORDER DETAILS
router.get(
  "/view-order-details/:orderid/:address",
  auth.authentication, auth.activeCheck,
  (req, res, next) => {
    try {
      const orderID = req.params.orderid;
    const addressID = req.params.address;
    console.log();
    userhelpers
      .orderInDetail(orderID, addressID, req.session.user._id)

      .then((response) => {
        const orderData = response.orderData;
        const address = response.address;
        console.log(address);
        console.log(orderData);
        if(orderData){
          res.render("users/orderdetails", {
            orderData,
            address,
            user: true,
            login: true,
          });
        }else{
          res.redirect('/view-orders')
        }
       
      })
      .catch((err) => {
        next(err);
      });
    } catch (error) {
      next(createError(404));
    }
  }
);


//to get user profile

router.get("/user-profile", auth.authentication, auth.activeCheck, async(req, res, next) => {
  try {
    if (req.session) {
      const user = await userSchema.findById(req.session.user._id)
          res.render("users/userprofile",{user});
    } else {
      res.redirect("/toLogin");
    }
    
  } catch (error) {
    next(createError(404));
  }
 
});


//edit profile modal
router.post("/edit-profile", auth.authentication, auth.activeCheck,async(req,res,next)=>{
  const body=req.body
  console.log(body);
await userSchema.findByIdAndUpdate(req.session.user._id,{$set:{userName:body.userName,email:body.email,phoneNumber:body.phoneNumber}})
res.redirect("/user-profile")
})
module.exports = router;



var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const adminhelpers = require('../helpers/adminhelpers')
const productHelper = require('../helpers/productHelpers')
const usercollection = require('../models/user-schema')
const productcollection = require('../models/product-schema');
const categorySchema = require('../models/category-schema')
const orders = require('../models/order-schema')
const ProductController = require("../controllers/Product-Controller")
const categoryController = require('../controllers/category-controller')
const { response } = require('express');
const auth = require('../middlewares/checkSession');
const { set } = require('mongoose');
const { find } = require('../models/user-schema');

/* GET admin login page. */
router.get('/', function (req, res, next) {
  try {
    if (req.session.admin) {
      res.redirect('/admin/adminHome',)
    } else if (req.session.logginError) {
      res.render('admin/admin-loginPage', { layout: 'loginLayout', logginError: req.session.logginError })
      req.session.logginError = false;
    }
    else {
      res.render('admin/admin-loginPage', { layout: 'loginLayout' })
    }
  } catch (error) {
    next(createError(404));
  }

});

// Do admin login
router.post('/adminLoggedIn', (req, res,next) => {

  adminhelpers.doLogin(req.body).then((response) => {
    try {
      if (response.status) {
        req.session.admin = true
        req.session.adminData = response.admin
        res.redirect('/admin/adminHome')
      } else {
        req.session.logginError = true;
        res.redirect('/admin')
      }
    } catch (error) {
      next(createError(404));
    }
    
  })
})

//Get admin home

router.get('/adminHome', auth.adminAuthentication, (req, res,next) => {
try {
  res.render('admin/admin-home', { layout: 'adminLayout' })
} catch (error) {
  next(createError(404));
}
  
})


// to logout
router.get('/logout', function (req, res, next) {
  try {
    req.session.destroy()
  res.redirect('/admin');
  } catch (error) {
    next(createError(404));
  }
  
});


//get users page
router.get('/users', auth.adminAuthentication, async (req, res,next) => {
  try {
    const users = await usercollection.find().lean()
  console.log(users);
  res.render('admin/users', { layout: 'adminLayout', users })
  } catch (error) {
    next(createError(404));
  }
  
})

//get categoryManagement page
router.get('/categoryManagement', auth.adminAuthentication, async (req, res,next) => {
  try {
    const categories = await categorySchema.find().lean()
    res.render('admin/category-management', { layout: 'adminLayout', categories })
  } catch (error) {
    next(createError(404));
  }
 
})

//get add category page
router.get('/addCategory', auth.adminAuthentication, async (req, res,next) => {
try {
  res.render('admin/add-category', { layout: 'adminLayout' })
} catch (error) {
  next(createError(404));
}
 
})


//block user
router.get('/block/:id', auth.adminAuthentication, (req, res,next) => {
  try {
    const user = req.params.id
    adminhelpers.blockUser(user).then(() => {
      res.redirect('/admin/users')
    })
  } catch (error) {
    next(createError(404));
  }
  
})

//unblock user
router.get('/unblock/:id', auth.adminAuthentication, (req, res,next) => {
  try {
    const user = req.params.id
  adminhelpers.unblockUser(user).then(() => {
    res.redirect('/admin/users')
  })
  } catch (error) {
    next(createError(404));
  }
})





//ADD CATEGORY

router.post('/categoryAdded', auth.adminAuthentication, (req, res,next) => {
  try {
    adminhelpers.addCategory(req.body).then((response) => {
      if (response.categoryExist) {
        res.redirect('/admin/addCategory')
      } else {
        res.redirect('/admin/addCategory')
      }
    })
  } catch (error) {
    next(createError(404));
  }
})
router.get("/products", auth.adminAuthentication, ProductController.addProduct)
router.post('/addProduct', auth.adminAuthentication, productHelper.uploadProductsImgs, ProductController.AddProducts)
router.post('/addCategory', auth.adminAuthentication, categoryController.addCategory)


//get users page
router.get('/product-management', auth.adminAuthentication, async (req, res,next) => {
 try {
  const products = await productcollection.find().lean()
  console.log(products);
  res.render('admin/product-management', { layout: 'adminLayout', products })
 } catch (error) {
  next(createError(404));
 }
})


//to delete product from database
router.get('/delete-product/:id', auth.adminAuthentication, ProductController.DeleteProduct)

//to edit product from database
router.get('/edit-product/:id', auth.adminAuthentication, ProductController.editProduct)

router.post('/edit-product/:id', auth.adminAuthentication, productHelper.uploadProductsImgs, ProductController.updateProduct)

router.route('/edit-category/:id', auth.adminAuthentication)
  .get((req, res,next) => {
    try {
      res.render('admin/edit-category', { layout: 'adminLayout', id: req.params.id })
    } catch (error) {
      next(createError(404));
    }
    
  })
  .post(async (req, res,next) => {
    try {
      await categorySchema.findByIdAndUpdate(req.params.id, { $set: { name: req.body.name } })
    res.redirect('/admin/categoryManagement')
    } catch (error) {
      next(createError(404));
    }
  })
  .delete(async (req, res,next) => {
   try {
    const cate = await productcollection.find({ category: req.params.id })
    if (cate.length > 0) {
      res.json({ message: "category already in use", status: 'failed' })
    } else {
      await categorySchema.findByIdAndDelete(req.params.id)
      res.json({ status: 'success' })
    }
   } catch (error) {
    next(createError(404));
   }
  })


router.get("/coupons", auth.adminAuthentication, (req, res, next) => {
 try {
  if (req.session.admin) {
    adminhelpers
      .getCoupons()
      .then((coupons) => {
        res.render("admin/coupons", {
          layout: 'adminLayout',
          coupons,

        });
      })
      
  } else {
    res.redirect("/admin");
  }
 } catch (error) {
  next(createError(404));
 }
});


router.get("/add-coupon", auth.adminAuthentication, (req, res,next) => {
  try {
    if (req.session.admin) {
      res.render("admin/add-coupon", { layout: 'adminLayout', categoryList: req.session.categoryList });
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    next(createError(404));
  }
});


router.post('/added-coupon', auth.adminAuthentication, (req, res,next) => {
  try {
    if (req.session.admin) {
      console.log("req.body", req.body)
      adminhelpers.addCoupon(req.body).then((status) => {
        res.json(status);
      })
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    next(createError(404));
  }
})

router.get('/logOut', (req, res,next) => {
  try {
    req.session.admin = null
  req.session.adminData = null
  } catch (error) {
    next(createError(404));
  }
})





//ORDER MANAGEMENT
router.get("/order-management", auth.adminAuthentication, async (req, res,next) => {
  
  try {
    const ordersList = await orders
    .find()
    .sort({ createdAt: -1 })
    .populate("userId")
    .populate("products.items")
    .lean();
  console.log(ordersList);
  res.render("admin/ordermanagement", {
    ordersList,
    layout: "adminLayout",
    categoryList: req.session.categoryList,
  });
  } catch (error) {
    next(createError(404));
  }
  
});

//CANCEL ORDER
router.get(
  "/cancel-order/:id",

  (req, res, next) => {
   try {
    adminhelpers
    .cancelOrder(req.params.id)
    .then((response) => {
      res.json(response);
    })
   } catch (error) {
    next(createError(404));
   }
      
  }
);

//PACK ORDERS
router.get(
  "/pack-order/:id",

  (req, res, next) => {
    try {
      adminhelpers
      .packOrder(req.params.id)
      .then((response) => {
        res.json(response);
      })
    } catch (error) {
      next(createError(404));
    }
    
      
  }
);

//SHIP ORDERS
router.get(
  "/ship-order/:id",

  (req, res, next) => {
   try {
    adminhelpers
    .shipOrder(req.params.id)
    .then((response) => {
      res.json(response);
    })
   } catch (error) {
    next(createError(404));
   }
      
  }
);

//SHIP ORDERS
router.get(
  "/deliver-order/:orderId/:userId",

  (req, res, next) => {
   try {
    adminhelpers
    .deliverOrder(req.params.orderId, req.params.userId)
    .then((response) => {
      res.json(response);
    })
   } catch (error) {
    next(createError(404));
   }
      
  }
);

//DELETE COUPON
router.get("/delete-coupon/:id", (req, res, next) => {
 try {
  if (req.session.admin) {
    adminhelpers
      .deleteCoupon(req.params.id)
      .then((response) => {
        res.json(response);
      })
      
  } else {
    res.redirect("/admin");
  }
 } catch (error) {
  next(createError(404));
 }
});

//EDIT COUPON
router.get(
  "/edit-coupon/:id",
  auth.adminAuthentication,
  (req, res, next) => {
   try {
    adminhelpers
    .editCoupon(req.params.id)
    .then((coupon) => {
      res.render("admin/editcoupon", {
        coupon,
        layout: "adminLayout",
        categoryList: req.session.categoryList,
      });
    })
   } catch (error) {
    next(createError(404));
   }
      
  }
);

//UPDATE COUPON
router.post("/update-coupon/:id", (req, res, next) => {

 try {
  adminhelpers
  .updateCoupon(req.params.id, req.body)
  .then((response) => {
    res.json(response);
  })
 } catch (error) {
  next(createError(404));
 }
    
});

router.get('/data', async (req, res,next) => {
 try {
  const order = await orders.find()
  const orderData = order.map(e => e.date)
  const uniqueDate = [... new Set(orderData)]
  let obj = []

  for (i = 0; i < uniqueDate.length; i++) {
    let j = await orders.find({ date: uniqueDate[i] })
    const k = j.reduce((acc, crr) => acc + crr.finalCost, 0)
    obj.push({ date: uniqueDate[i], sales: k })
  }
  console.log(obj)
  res.json({ obj })
 } catch (error) {
  next(createError(404));
 }
})

















module.exports = router;
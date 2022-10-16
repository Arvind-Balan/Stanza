var express = require('express');
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
  if (req.session.admin) {
    res.redirect('/admin/adminHome',)
  } else if (req.session.logginError) {
    res.render('admin/admin-loginPage', { layout: 'loginLayout', logginError: req.session.logginError })
    req.session.logginError = false;
  }
  else {
    res.render('admin/admin-loginPage', { layout: 'loginLayout' })
  }
});

// Do admin login
router.post('/adminLoggedIn', (req, res) => {
  adminhelpers.doLogin(req.body).then((response) => {
    //console.log(response);
    if (response.status) {
      req.session.admin = true
      req.session.adminData = response.admin
      res.redirect('/admin/adminHome')
    } else {
      req.session.logginError = true;
      res.redirect('/admin')
    }
  })
})

//Get admin home

router.get('/adminHome', auth.adminAuthentication, (req, res) => {

  res.render('admin/admin-home', { layout: 'adminLayout' })
})


// to logout
router.get('/logout', function (req, res, next) {
  req.session.destroy()
  res.redirect('/admin');
});


//get users page
router.get('/users', auth.adminAuthentication, async (req, res) => {
  const users = await usercollection.find().lean()
  console.log(users);
  res.render('admin/users', { layout: 'adminLayout', users })
})

//get categoryManagement page
router.get('/categoryManagement', auth.adminAuthentication, async (req, res) => {
  const categories = await categorySchema.find().lean()
  res.render('admin/category-management', { layout: 'adminLayout', categories })
})

//get add category page
router.get('/addCategory', auth.adminAuthentication, async (req, res) => {

  res.render('admin/add-category', { layout: 'adminLayout' })
})


//block user
router.get('/block/:id', auth.adminAuthentication, (req, res) => {
  const user = req.params.id
  adminhelpers.blockUser(user).then(() => {
    res.redirect('/admin/users')
  })
})

//unblock user
router.get('/unblock/:id', auth.adminAuthentication, (req, res) => {
  const user = req.params.id
  adminhelpers.unblockUser(user).then(() => {
    res.redirect('/admin/users')
  })
})





//ADD CATEGORY

router.post('/categoryAdded', auth.adminAuthentication, (req, res) => {
  adminhelpers.addCategory(req.body).then((response) => {
    if (response.categoryExist) {
      res.redirect('/admin/addCategory')
    } else {
      res.redirect('/admin/addCategory')
    }
  })
})
router.get("/products", auth.adminAuthentication, ProductController.addProduct)




router.post('/addProduct', auth.adminAuthentication, productHelper.uploadProductsImgs, ProductController.AddProducts)
router.post('/addCategory', auth.adminAuthentication, categoryController.addCategory)


//get users page
router.get('/product-management', auth.adminAuthentication, async (req, res) => {
  const products = await productcollection.find().lean()
  console.log(products);
  res.render('admin/product-management', { layout: 'adminLayout', products })
})


//to delete product from database
router.get('/delete-product/:id', auth.adminAuthentication, ProductController.DeleteProduct)

//to edit product from database
router.get('/edit-product/:id', auth.adminAuthentication, ProductController.editProduct)

router.post('/edit-product/:id', auth.adminAuthentication, productHelper.uploadProductsImgs, ProductController.updateProduct)

router.route('/edit-category/:id', auth.adminAuthentication)
  .get((req, res) => {
    res.render('admin/edit-category', { layout: 'adminLayout', id: req.params.id })
  })
  .post(async (req, res) => {
    await categorySchema.findByIdAndUpdate(req.params.id, { $set: { name: req.body.name } })
    res.redirect('/admin/categoryManagement')
  })
  .delete(async (req, res) => {
    const cate = await productcollection.find({ category: req.params.id })
    if (cate.length > 0) {
      res.json({ message: "category already in use", status: 'failed' })
    } else {
      await categorySchema.findByIdAndDelete(req.params.id)
      res.json({ status: 'success' })
    }
  })


router.get("/coupons", auth.adminAuthentication, (req, res, next) => {
  if (req.session.admin) {
    adminhelpers
      .getCoupons()
      .then((coupons) => {
        res.render("admin/coupons", {
          layout: 'adminLayout',
          coupons,

        });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/admin");
  }
});


router.get("/add-coupon", auth.adminAuthentication, (req, res) => {
  if (req.session.admin) {
    res.render("admin/add-coupon", { layout: 'adminLayout', categoryList: req.session.categoryList });
  } else {
    res.redirect("/admin");
  }
});


router.post('/added-coupon', auth.adminAuthentication, (req, res) => {
  if (req.session.admin) {
    console.log("req.body", req.body)
    adminhelpers.addCoupon(req.body).then((status) => {
      res.json(status);
    })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/admin");
  }
})

router.get('/logOut', (req, res) => {
  req.session.admin = null
  req.session.adminData = null
})





//ORDER MANAGEMENT
router.get("/order-management", auth.adminAuthentication, async (req, res) => {
  // if (req.session.admin) {
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
  // } else {
  //   res.redirect("/admin");
  // }
});

//CANCEL ORDER
router.get(
  "/cancel-order/:id",

  (req, res, next) => {
    console.log(req.params.id);
    adminhelpers
      .cancelOrder(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//PACK ORDERS
router.get(
  "/pack-order/:id",

  (req, res, next) => {
    adminhelpers
      .packOrder(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//SHIP ORDERS
router.get(
  "/ship-order/:id",

  (req, res, next) => {
    adminhelpers
      .shipOrder(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//SHIP ORDERS
router.get(
  "/deliver-order/:orderId/:userId",

  (req, res, next) => {
    adminhelpers
      .deliverOrder(req.params.orderId, req.params.userId)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  }
);

//DELETE COUPON
router.get("/delete-coupon/:id", (req, res, next) => {
  if (req.session.admin) {
    adminhelpers
      .deleteCoupon(req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  } else {
    res.redirect("/admin");
  }
});

//EDIT COUPON
router.get(
  "/edit-coupon/:id",
  auth.adminAuthentication,
  (req, res, next) => {
    adminhelpers
      .editCoupon(req.params.id)
      .then((coupon) => {
        res.render("admin/editcoupon", {
          coupon,
          layout: "adminLayout",
          categoryList: req.session.categoryList,
        });
      })
      .catch((err) => {
        next(err);
      });
  }
);

//UPDATE COUPON
router.post("/update-coupon/:id", (req, res, next) => {

  adminhelpers
    .updateCoupon(req.params.id, req.body)
    .then((response) => {
      res.json(response);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/data', async (req, res) => {
  const order = await orders.find()
  const orderData = order.map(e => e.date )
  const uniqueDate = [... new Set(orderData)]
  let obj =[]

  for(i=0;i<uniqueDate.length;i++){
  let j= await orders.find({date:uniqueDate[i]}) 
const k = j.reduce((acc,crr)=>acc+crr.finalCost,0)
obj.push({date:uniqueDate[i],sales:k})
  }
  console.log(obj)
  res.json({obj})
})

















module.exports = router;
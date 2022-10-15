const productSchema = require('../models/product-schema')
const multer = require('multer');
const product = require('../models/product-schema');

    //CONFIGURATION OF MULTER
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images/products");
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `products-${file.fieldname}-${Date.now()}.${ext}`);
    },
  });
  
  //MULTER FILTER
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "jpg" || "jpeg" || "png" || "webp") {
      cb(null, true);
    } else {
      cb(new Error("Not a JPG File!"), false);
    }
  };
  
  //CALLING THE MULTER FUNCTION
  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });  
exports.uploadProductsImgs = upload.array("images", 3);

exports.addProduct=(data)=>{
    return new Promise((res,rej)=>{
        const product = new productSchema(data)
        product.save().then((status)=>{
            res(status)
        })
        .catch((err)=>{
            rej(err)
        })
     
    })
}

//for delete product adminside

exports.deleteProduct=(productId)=>{
  return new Promise(async(res,rej)=>{
    await productSchema.deleteOne({_id:productId})
    res(true)
  })
}

//for editing the product

exports.getProductDetails=(productId)=>{
  return new Promise(async(res,rej)=>{
    await productSchema.findOne({_id:productId}).lean().then((product)=>{
      console.log(product);
      res(product)
    })
  })
}

//updating the product

exports.updateProduct=(productId,data)=>{
  console.log(productId,data)
  return new Promise(async(resolve,reject)=>{
    //console.log("kl",data);
    await productSchema.findOneAndUpdate({_id:productId},{
      name:data.name,
      brand:data.brand,
      details:data.details,
      description:data.description,
      category:data.category,
      quantity:data.quantity,
      actualPrice:data.actualPrice,
      sellingPrice:data.sellingPrice,
      images:data.images

    }).then((response)=>{
    
      resolve(response)
    })
  })
}

//adding to cart

exports.addingToCart=(proId,userId)=>{
  return new promise((resolve,reject)=>{
    
  })
}



exports.addCategory=(data)=>{
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
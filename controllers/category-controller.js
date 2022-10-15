
module.exports={
    addCategory:function(req,res,next){
        
            categoryHelper.addCategory(req.body).then((result)=>{
             
              res.redirect('/admin/category-management')
            })
            .catch((err)=>{
                next(err)
            })
        },
}
const express = require('express');
const router = express.Router();
const {database} = require("../conf/helper");

router.get('/',(req,res)=>{
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1; //set the current page number
    let limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; //set the limit per page
    
    let startValue;
    let endValue;

    if (page>0){
        startValue = page * limit - limit;
        endValue = page * limit
    }else{
        startValue = 0;
        endValue = 10
    }

    database.table('products as p')
    .join([{
        table:'categories as c',
        on:'c.id = p.cat_id'
    }])
    .slice(startValue,endValue)
    .withFields(['c.title as category','p.title as name','p.price','p.quantity','p.image','p.id','p.description'])
    .sort({id:.1})
    .getAll()
    .then(prods=>{
        if (prods.length>0){
            res.status(200).json({
                count: prods.length,
                products:prods
            })
        }else{
            res.json({message:'no products found'})
        }
    }).catch(err=>console.log(err))

})

router.get('/:prodId',(req,res)=>{

    let prodId = req.params.prodId;
    database.table('products as p')
    .join([{
        table:'categories as c',
        on:'c.id = p.cat_id'
    }])
    .withFields(['c.title as category','p.title as name','p.price','p.description','p.quantity','p.image','p.images','p.id'])
    .filter({'p.id':prodId})
    .get()
    .then(prod=>{
        if (prod){
            res.status(200).json({
                product:prod
            })
        }else{
            res.json({message:`no product found with product id ${prodId}`})
        }
    }).catch(err=>console.log(err))

})

router.get('/categories/:catId',(req,res)=>{
    
    // fetch the category name from the url
    let cat_id = req.params.catId;

    database.table('products as p')
    .join([{
        table:'categories as c',
        on:`c.id = p.cat_id WHERE c.title LIKE '%${cat_id}%'`
    }])
    .withFields(['c.title as category','p.title as name','p.price','p.description','p.quantity','p.image','p.id'])
    .sort({id:.1})
    .getAll()
    .then(prods=>{
        console.log(prods[0])
        if (prods.length>0){
            res.status(200).json({
                count: prods.length,
                products:prods
            })
        }else{
            res.json({message:`no products found in the ${cat_id} category`})
        }
    }).catch(err=>console.log(err))

})

module.exports = router

const express = require('express');
const router = express.Router();
const {database} = require('../conf/helper');

// fetch all categories
router.get('/',(req,res)=>{
    database.table('categories')
    .getAll()
    .then(categories=>{
        if(categories.length > 0){
            res.status(200).json({
                count: categories.length,
                categories:categories
            })
        }else{
            res.json({
                message:'no category found'
            })
        }
    }).catch(err=>console.log(err))
})

// add new category
router.post('/new',(req,res)=>{
    console.log(req.body)
    let {category} = req.body;
    database.table('categories')
    .insert({title:category})
    .then(newcatobj=>{
        if(newcatobj.insertId > 0){
            res.json({
                message:`category successfully created with category id ${newcatobj.insertId}`,
                success:true,
                catid: newcatobj.insertId,
                category:category
            })
        }else{
            res.json({message:'failed to add new category',success:false})
        }
    })
})

module.exports = router
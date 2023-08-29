const express = require('express');
const router = express.Router();
const {database} = require("../conf/helper");

// fetch all users
router.get('/',(req,res)=>{
    database.table('users')
    .getAll()
    .then(users=>{
        if(users.length > 0){
            res.status(200).json({
                count: users.length,
                users:users
            })
        }else{
            res.json({
                message:'no users found'
            })
        }
    }).catch(err=>console.log(err))
})

router.get("/:userId",(req,res)=>{
    userId = req.params.userId;
    database.table('users')
    .filter({'users.id':userId})
    .get()
    .then(user=>{
        console.log(user);
        if(user.id){
            res.status(200).json(user)
        }else{
            res.json({message:`no orders with orderId ${userId} found `})
        }
    }).catch(err => console.log(err))
})

module.exports = router
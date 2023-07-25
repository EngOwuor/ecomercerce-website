
const express = require('express');
const router = express.Router();
const {database} = require('../conf/helper');

// Fetch all orders
router.get('/',(req,res)=>{
    database.table('orders_details as od')
    .join([
        {
            table:'orders as o',
            on: 'o.id = od.order_id'
        },
        {
            table: 'products as p',
            on: 'p.id = od.product_id'
        },
        {
            table : 'users as u',
            on: 'u.id = o.user_id'
        }
    ])
    .withFields(['o.id','p.title as name','p.description','p.price','p.quantity','u.username'])
    .getAll()
    .then(orders=>{
        if (orders.length>0){
            res.status(200).json({
                count: orders.length,
                orders:orders
            })
        }else{
            res.json({message:`no products found `})
        }
    }).catch(err=>console.log(err))
})

router.get('/:orderId',(req,res)=>{

    const orderId = req.params.orderId;
    //console.log(orderId)
    database.table('orders_details as od')
    .join([
        {
            table:'orders as o',
            on: 'o.id = od.order_id'
        },
        {
            table: 'products as p',
            on: 'p.id = od.product_id'
        },
        {
            table : 'users as u',
            on: 'u.id = o.user_id'
        }
    ])
    .withFields(['o.id','p.title as name','p.image','p.description','p.price','p.quantity','u.username'])
    .filter({'o.id':orderId})
    .getAll()
    .then(orders=>{
        console.log(orders)
        console.log(orders.length)
        if (orders.length>0){
            res.status(200).json({
                count: orders.length,
                orders:orders
            })
        }else{
            res.json({message:`no orders with orderId ${orderId} found `})
        }
    }).catch(err=>console.log(err))
})

router.post('/new',(req,res)=>{
    //console.log(req.body)
    let {userId,products} = req.body;
    
    
    if(userId !== null && userId > 0 && !isNaN(userId)){
        database.table('orders')
        .insert({
            user_id:userId
        })
        .then(newOrderId=>{
            //console.log(newOrderId)
            if(newOrderId.insertId>0){
                products.forEach(async p => {

                    let data = await database.table('products').filter({id:p.id}).withFields(['quantity']).get();
                    let inCart = p.incart
                    
                    // deduct number of items ordererd from the items in stock
                    if(data.quantitity>0){
                        data.quantitity = data.quantitity - inCart;
                        if(data.quantitity<0){
                            data.quantitity=0 
                        }
                    }else{
                        data.quantitity=0
                    }

                    //insert order details w.r.t the newly generated order id
                    database.table('orders_details')
                    .insert({
                        order_id:newOrderId.insertId,
                        product_id:p.id,
                        quantity:inCart
                    })
                    .then(
                        newId =>{
                            database.table('products')
                            .filter({id:p.id})
                            .update({quantity:data.quantity})
                            .then(success=>{}).catch(err=>{console.log(err)});
                        }
                    ).catch(err=>console.log(err))


                });
                res.json({
                    message:`order successfully created with order id ${newOrderId.insertId}`,
                    success:true,
                    order_id: newOrderId.insertId,
                    products:products
                })
            }else{
                res.json({message:'new order failed while adding order details',success:false})
            }
            /*res.json({
                message:`order successfully created with order id ${newOrderId}`,
                success:true,
                order_id: newOrderId,
                products:products
            })*/
        })
        .catch(err=>console.log(err))
    }

})

// Payment Gateway
router.post('/payment', (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000)
});
module.exports = router

const express = require('express');
const {check, validationResult, body} = require('express-validator');
const router = express.Router();
const helper = require('../conf/helper');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// LOGIN ROUTE
/*router.post('/login',(req,res)=>{
    console.log(req.body)
    res.send('hey , it worked')
})
*/
router.post('/login', [helper.hasAuthFields, helper.isPasswordAndUserMatch], (req, res) => {
    //console.log(req.body)
    let token = jwt.sign({state: 'true', email: req.body.email, username: req.body.username}, helper.secret, {
        algorithm: 'HS512',
        expiresIn: '4h'
    });
    res.json({token: token, auth: true, email: req.body.email, username: req.body.username,userId:req.id});
});

// REGISTER ROUTE
router.post('/register', [
    check('email').isEmail().not().isEmpty().withMessage('Field can\'t be empty')
        .normalizeEmail({all_lowercase: true}),
    check('password').escape().trim().not().isEmpty().withMessage('Field can\'t be empty')
        .isLength({min: 6}).withMessage("must be 6 characters long"),
    body('email').custom(value => {
        return helper.database.table('users').filter({
            $or:
                [
                    {email: value}, {username: value.split("@")[0]}
                ]
        }).get().then(user => {
            if (user) {
                console.log('user already exists')
                console.log(user);
                //return Promise.reject('Email / Username already exists, choose another one.');
                return Promise.reject('Email / Username already exists, choose another one.');
            }
        })
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('errors in validationResult')
        console.log(errors.array())
        return res.status(422).json({errors: errors.array()});
    } else {

        let email = req.body.email;
        let username = email.split("@")[0];
        let password = await bcrypt.hash(req.body.password, 10);
        let fname = req.body.fname;
        let lname = req.body.lname;
        let fphone = req.body.fphone;
        let sphone = req.body.sphone;

        /**
         * ROLE 777 = ADMIN
         * ROLE 555 = CUSTOMER
         **/
        helper.database.table('users').insert({
            username: username,
            password: password,
            email: email,
            primary_phone:fphone,
            secondary_phone:sphone,
            role: 555,
            lname: lname, //|| null,
            fname: fname //|| null
        }).then(lastId => {
            console.log('user insert successful')
            console.log(lastId)
            if (lastId.insertId > 0) {
                console.log(lastId.insertId)
                res.status(201).json({message: 'Registration successful.',insertId:lastId.insertId});
            } else { 
                res.status(501).json({message: 'Registration failed.',insertId:null});
            }
        }).catch(err => res.status(433).json({error: err}));
    }
});


module.exports = router;

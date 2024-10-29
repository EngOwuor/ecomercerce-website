const Mysqli = require('mysqli');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let conn = new Mysqli({
    //host :'localhost', // IP/domain name 
    //post:'3306', //port, default 3306
   // user:'robert', //username
    //passwd:'robert',//password 
   // db:'mega_shop'//'mega_shop
    socketPath: '/cloudsql/fleet-flame-288817:us-central1:quickstart-user',
    user:'quickstart-user',//'mega_user' username 
    passwd:'root',//password ,
    db:'quickstart-database'//'mega_shop'
    
});

let db = conn.emit(false, '');

const secret = "1SBz93MsqTs7KgwARcB0I0ihpILIjk3w";
   
module.exports = {
    database: db,
    secret: secret,
    validJWTNeeded: (req, res, next) => {
        if (req.headers['authorization']) {
            try {
                let authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    req.jwt = jwt.verify(authorization[1], secret);
                    return next();
                }
            } catch (err) {
                return res.status(403).send("Authentication failed ");
            }
        } else {
            return res.status(401).send("No authorization header found.");
        }
    },    
    hasAuthFields: (req, res, next) => {
        let errors = [];
        console.log(req.body);

        if (req.body) {
            if (!req.body.email) {
                errors.push('Missing email field');
            }
            if (!req.body.password) {
                errors.push('Missing password field');
            }

            if (errors.length) {
                return res.status(400).send({errors: errors.join(',')});
            } else {
                return next();
            }
        } else {
            return res.status(400).send({errors: 'Missing email and password fields'});
        }
    },
    isPasswordAndUserMatch: async (req, res, next) => {
        const myPlaintextPassword = req.body.password;
        const myEmail = req.body.email;          
              
        const user = await db.table('users').filter({$or:[{ email : myEmail },{ username : myEmail }]}).get();
        console.log(user);
        if (user) {
            //console.log(myPlaintextPassword)
           // console.log(user.password)
            const match = await bcrypt.compare(myPlaintextPassword, user.password);
            //console.log(match)
            if (match) {
                req.username = user.username;
                req.email = user.email;
                req.id = user.id
                next();
            } else {
                res.status(401).send(" password incorrect");
                //res.status(401).send("Username or password incorrect");
            }
            
        } else {
            res.status(401).send("No User Found with that email address");
            //res.status(401).send("Username or password incorrect");
        }
        
        
        

    }
};

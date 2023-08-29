const express =require('express')
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

//import routes
const productsRoute = require('./routes/products');
const ordersRoute = require('./routes/orders'); 
const authRoute = require('./routes/auth');
const categoriesRoute = require('./routes/categories')
const usersRoute = require('./routes/users')

app.use(cors({
    origin:'*',
    methods:['GET','POST','PATCH','DELETE','PUT'],
    allowedHeaders:'Content-Type,Authorization, Origin, x-Requested-With,Accept'
}))
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded  
app.use(bodyParser.urlencoded({ extended: false }))



app.get('/',(req,res)=>{
    res.send('hey').end()
})

app.use('/api/products',productsRoute);
app.use('/api/orders',ordersRoute);
app.use('/api/auth',authRoute);
app.use('/api/categories',categoriesRoute)
app.use('/api/users',usersRoute)

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

process.on('unhandledRejection', err => {
  console.error(err);
  throw err;
});


const express = require('express');
const connectDB = require('./config/db');

const app = express();

//ANCHOR connect to database 
connectDB();

//ANCHOR Init Middleware
app.use(express.json({extended: false})); //NOTE Allow us to read the request.body

//ANCHOR Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profiles'));
app.use('/api/posts', require('./routes/api/posts'));



//NOTE It will look at varaible name PORT in .env file 
// if can't find PORT or no variable is set, then this const will be set to 5000 automatically
const PORT = process.env.PORT || 5000;

//NOTE get respond from path '/'
app.get('/', (req,res) => res.send('API Running')) //send response (text) to this path

app.listen(PORT, () => console.log(`Server stated on port ${PORT}`));
const express = require('express');

const app = express();
//NOTE It will look at varaible name PORT in .env file 
// if can't find PORT or no variable is set, then this const will be set to 5000 automatically
const PORT = process.env.PORT || 5000;

//NOTE get respond from path '/'
app.get('/', (req,res) => res.send('API Running')) //send response (text) to this path

app.listen(PORT, () => console.log(`Server stated on port ${PORT}`));
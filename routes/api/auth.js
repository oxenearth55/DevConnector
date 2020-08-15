const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); //middleware
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator'); 
const jwt = require('jsonwebtoken');
const config = require('config');
//ANCHOR @route GET api/auth
//ANCHOR Test route
//ANCHOR Public
router.get('/', auth , async (req,res) => {
    try{
        //NOTE findById fill grab user id and then use that id to find the user 
        //req.user came from middleware (auth)
        const user = await User.findById(req.user.id).select('-password'); //NOTE leave password
        res.json(user);

    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');

    }
});

//ANCHOR @route: POST api/auth
//ANCHOR @Description: Authenticate user & get token
//ANCHOR Public
router.post('/',[
    //NOTE paremeter meaning = ('property name', 'message')
   
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
    
] ,async (req,res) => {
    const errors = validationResult(req);
    //NOTE if there is error in check method above then, return 400 status and error message 
    if(!errors.isEmpty()){// not empty 
        //NOTE 400 means error happened, 200 = not thing wrong
        return res.status(400).json({ errors: errors.array()}); //NOTE array() use to send error message from check() to res
    }
    console.log(req.body); //NOTE see what we goning to post to the api so to use this, we have to have init middleware (bodyparser) in server.js

    //NOTE password and email that user input to login the system
    const {email, password} = req.body;

    try{
    //ANCHOR See if user not exists 
    //NOTE check this email is already use by another users?
    let user = await User.findOne({email}); // NOTE findOne is used to find and return specific value from database
    if(!user){
       return res.status(400).json({errors: [{msg:'Invalid Credentials'}]});
    }
    //NOTE compare input password and password in database (decypt pass)
    const isMatch = await bcrypt.compare(password, user.password); 

    if(!isMatch){
        return res.status(400).json({errors: [{msg:'Invalid  Credentials'}]});
    }
    
   
   


    //ANCHOR Return jsonwebtoken
    //NOTE https://konoesite.com/%E0%B8%97%E0%B8%B3%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B8%B9%E0%B9%89%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%81%E0%B8%B1%E0%B8%9A-jwt-b8fcf52aa008
    //NOTE payload is the things that we want to keep in token as an Object
    const payload = {
        user:{
            id: user.id
        }
    }
    //NOTE signature is used to combine header, payload and secret key using Base64 
    jwt.sign(
        payload,
        config.get('jwtSecret'),
        {expiresIn: 36000},
        // Callback 
        (err,token) => {
            if(err) throw err; 
            res.json({ token })
        }
    );

    // res.send('User registered');

    } catch(err){ //NOTE when something wrong on the server (try function above)
        console.error(err.message);
        res.status(500).send('Server error');

    }

   

});

module.exports = router;




const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
//NOTE used to check and send the message when error happen
// you can see more functions about express-validator in the document
const {check, validationResult} = require('express-validator'); 

const User = require('../../models/User');

//ANCHOR @route: POST api/users
//ANCHOR @Description: Register users
//ANCHOR Public
router.post('/',[
    //NOTE paremeter meaning = ('property name', 'message')
    check('name', 'Name is required')
    .not()
    .isEmpty(), 
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min:6
    })
    
] ,async (req,res) => {
    const errors = validationResult(req);
    //NOTE if there is error in check method above then, return 400 status and error message 
    if(!errors.isEmpty()){// not empty 
        //NOTE 400 means error happened, 200 = not thing wrong
        return res.status(400).json({ errors: errors.array()}); //NOTE array() use to send error message from check() to res
    }
    console.log(req.body); //NOTE see what we goning to post to the api so to use this, we have to have init middleware (bodyparser) in server.js

    const {name, email, password} = req.body;

    try{
    //ANCHOR See if user exists 
    //NOTE check this email is already use by another users?
    let user = await User.findOne({email}); // NOTE findOne is used to find and return specific value from database
    if(user){
       return res.status(400).json({errors: [{msg:'User already exists'}]});
    }
    
    //ANCHOR Get user gravatar

    const avatar = gravatar.url(email,{
        s: '200', //size
        r: 'pg',
        d: 'mm' //default: when user don't have avatar on email

    })
    //NOTE user maintain these properties before saving in the database
    user = new User({
        name,
        email,
        avatar,
        password
    });

    //ANCHOR Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();


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








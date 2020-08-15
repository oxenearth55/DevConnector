const express = require('express');
const router = express.Router();

//ANCHOR @route GET api/posts
//ANCHOR Test route
//ANCHOR Public
router.get('/', (req,res) => res.send('Posts route'));

module.exports = router;




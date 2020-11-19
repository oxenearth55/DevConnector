const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator');
const auth = require('../../middleware/auth'); 
const Post = require('../../models/Post'); 
const Profile = require('../../models/Profile'); 
const User = require('../../models/User'); 



//ANCHOR @route POST api/posts
//ANCHOR Create a post 
//ANCHOR Private
router.post('/',[auth,

    check('text', 'Text is required')
    .not()
    .isEmpty()

], async (req,res) => {
    const errors = validationResult(req); 
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});

    }

    try{

    //NOTE grab this user from token (res.user.id)
    const user = await User.findById(req.user.id).select('-password');

    //NOTE Object of post 
    const newPost = new Post({
        text: req.body.text, 
        name : user.name, 
        avartar: user.avartar,
        user: req.user.id
    });

    const post = await newPost.save(); 
    res.json(post);

    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');

    }
   

});

//ANCHOR @route GET api/posts
//ANCHOR GET all posts 
//ANCHOR Private 
router.get('/', async (req,res) => {
    try{ 
        const posts = await Post.find().sort({date: -1}); //NOTE the most recent first
        res.json(posts);
    
    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');
    }
});


//ANCHOR @route GET api/posts/:id
//ANCHOR GET posts by ID 
//ANCHOR Private
router.get('/:id',auth, async (req,res) => {
    try{ 
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.json(post);
    
    }catch(err){
        console.error(err.message); 
        if(err.kind == 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});


//ANCHOR @route DELETE api/posts/:id
//ANCHOR Delete a post 
//ANCHOR Private
router.delete('/:id',auth, async (req,res) => {
    try{ 
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({ msg: 'Post not found'});
        }
       
        //NOTE Check user
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ msg : 'User not authorize'})//NOTE 401 means not authorized
        }
        await post.remove();
        res.json({msg: 'Post is removed'});
    
    }catch(err){
        console.error(err.message); 
        if(err.kind == 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

//ANCHOR @route PUT api/posts/like/:id
//ANCHOR Like a post 
router.put('/like/:id', auth, async (req, res) => {
    try{
     const post = await Post.findById(req.params.id); 
     //ANCHOR Check if the post has already been linked 
        if(post.likes.filter(like => like.user.toString() === req.user.id).length >0 ){
            return res.status(400).json({msg: 'Post already liked'});
        }
        post.likes.unshift({user: req.user.id});
        await post.save(); 
        res.json(post.likes);
    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');
    }
});

//ANCHOR @route PUT api/posts/unlike/:id
//ANCHOR unlike a post 
//ANCHOR 
router.put('/unlike/:id', auth, async (req, res) => {
    try{
     const post = await Post.findById(req.params.id); 
     //ANCHOR Check if the post has not been liked 
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0 ){
            return res.status(400).json({msg: 'Post has not yet been liked'});
        }

    //ANCHOR Get remove index 
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex,1);
        await post.save(); 
        res.json(post.likes);
    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');
    }
});

//ANCHOR @route POST api/posts/comment/:id
//ANCHOR Comment on a post 
//ANCHOR Private
router.post('/comment/:id',[auth,

    check('text', 'Text is required')
    .not()
    .isEmpty()

], async (req,res) => {
    const errors = validationResult(req); 
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});

    }

    try{

    //NOTE grab this user from token (res.user.id)
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    //NOTE Object of post 
    const newComment = {
        text: req.body.text, 
        name : user.name, 
        avartar: user.avartar,
        user: req.user.id
    };

    post.comments.unshift(newComment);
    await post.save(); 


    res.json(post.comments);

    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');

    }
   

});

//ANCHOR @route DELETE api/posts/comment/:id/:comment_id
//ANCHOR Delete Comment
//ANCHOR Private

router.delete('/comment/:id/:comment_id', auth, async (req,res) => {

    try{
        const post = await Post.findById(req.params.id);

        //NOTE Pull out comment 
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //NOTE Make sure comment exist 
        if(!comment){
            return escape.status(404).json({msg: 'Comment does not exist'});
        }

        //NOTE Check user
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User not authorized'});
        }
        //ANCHOR Get remove index 
    const removeIndex = post.comments
    .map(comment => comment.user.toString())
    .indexOf(req.user.id);

    post.comments.splice(removeIndex,1);
        await post.save(); 
        res.json(post.comments);


    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');

    }

});




module.exports = router;




const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth'); //NOTE used to verify token and response user.id
const { check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const c = require('config');
const { response } = require('express');

//ANCHOR @route GET api/profile/me
//ANCHOR Get current users peofile
//ANCHOR Private
router.get('/me', auth, async (req,res) => {
    try{
        const profile = await  Profile
            .findOne({user: req.user.id}) // user is property in Profile(models), req.user.id came from token verify in auth(middleware)
            .populate('user',['name', 'avatar']) // populare is used to select property that we want

            if(!profile){
                return res.status(400).json({msg: 'There is no profile for this user'});
            }
            res.json(profile);

    } catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//ANCHOR @route POST api/profile
//ANCHOR Create or update user profile
//ANCHOR Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skill is required').not().isEmpty()

]],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});     
    }
    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;
//ANCHOR Build profile object 
//NOTE before sending to database, we have to group properties as an object
const profileFields = {};
profileFields.user = req.user.id; //id from token (middleware)
if(company) profileFields.company = company;
if(website) profileFields.website = website;
if(location) profileFields.location = location;
if(status) profileFields.status = status;
if(githubusername) profileFields.githubusername = githubusername;
if(skills){
//NOTE The trim() method removes whitespace from both ends of a string. 
profileFields.skills = skills.split(',').map(skill => skill.trim()); //split is used to generate an Array
}
//ANCHOR Build social object array
profileFields.social = {}
if(youtube) profileFields.social.youtube = youtube;
if(twitter) profileFields.social.twitter = twitter;
if(instagram) profileFields.social.instagram = instagram;
if(linkedin) profileFields.social.linkedin = linkedin;
if(facebook) profileFields.social.facebook = facebook;

try{
    let profile = await Profile.findOne({user: req.user.id});
    //ANCHOR Update
    if(profile){
        profile = await Profile.findOneAndUpdate({user: req.user.id}, { $set: profileFields}, {new: true});
        return res.json(profile)
    }
    //ANCHOR Create when this user is not yet create profile
    profile = new Profile(profileFields);
    await profile.save(); 
     res.json(profile)
    

}catch(err){
    res.status(500).send('Server Error oe');

}



})

//ANCHOR @route GET api/profile
//ANCHOR GET all profile
//ANCHOR Public
router.get('/', async (req,res) => {
    try{
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);


    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
        
    }

})


//ANCHOR @route GET api/profile/user/:user_id
//ANCHOR GET profile by user ID
//ANCHOR Public
router.get('/user/:user_id', async (req,res) => {
    try{
        //NOTE params will look at the path /:something
        //In profile, user type is user ID  
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({msg: 'Profile not found'}
        );
        res.json(profile);


    }catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found'})

        }
        res.status(500).send('Server Error')
        
    }

})

//ANCHOR @route DELETE api/profile
//ANCHOR Delete profile user & posts
//ANCHOR Private
router.delete('/',auth, async (req,res) => {
    try{
        //ANCHOR Remove users posts

        //ANCHOR Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        
        //ANCHOR Remove user
        await User.findOneAndRemove({_id: req.user.id});

        res.json({msg: 'User deleted'});

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

//ANCHOR @route PUT api/profile/experiance
//ANCHOR Add profile experiance
//ANCHOR Private
router.put('/experience', [auth, 
    check('title', 'Title is required')
    .not()
    .isEmpty(), 
    check('company', 'Company is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required').not().isEmpty()
], 
async(req,res) => {
    const errors = validationResult(req); 
    if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    //NOTE Object from user submit 
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try{
        const profile = await Profile.findOne({user: req.user.id});
        // NOTE unshift quite similar to push() but unshift push array to the top unlike
        //NOTE In profile newer experiance should on the top of the array when adding a new one
        profile.experience.unshift(newExp);  
        await profile.save(); 
        res.json(profile);

    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server error');
    }


})


//ANCHOR @route DELETE api/profile/experiance/:exp_id
//ANCHOR Delete experience from profile
//ANCHOR Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
   
      //NOTE When it match with the condition in filter(), then put it to new array
      foundProfile.experience = foundProfile.experience.filter(
        (exp) => exp._id.toString() !== req.params.exp_id
      );
   
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });


  //ANCHOR @route PUT api/profile/education
//ANCHOR Add profile education
//ANCHOR Private
router.put('/education', [auth, 
    check('school', 'School is required')
    .not()
    .isEmpty(), 
    check('degree', 'Degree is required')
    .not()
    .isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),

    
], 
async(req,res) => {
    const errors = validationResult(req); 
    if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    //NOTE Object from user submit 
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try{
        const profile = await Profile.findOne({user: req.user.id});
        // NOTE unshift quite similar to push() but unshift push array to the top unlike
        //NOTE In profile newer experiance should on the top of the array when adding a new one
        profile.education.unshift(newEdu);  
        await profile.save(); 
        res.json(profile);

    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server error');
    }


})


//ANCHOR @route DELETE api/profile/education/:edu_id
//ANCHOR Delete education from profile
//ANCHOR Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
      const foundProfile = await Profile.findOne({ user: req.user.id });
   
      //NOTE When it match with the condition in filter(), then put it to new array
      foundProfile.education = foundProfile.education.filter(
        (exp) => exp._id.toString() !== req.params.edu_id
      );
   
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Server error' });
    }
  });


//ANCHOR @route POST api/profile/github/:username
//ANCHOR Get user repo from Github 
//ANCHOR Public

router.get('/github/:username', (req,res) => {
    try{
        const options = { // Object 
            uri: `https://api.github.com/users/${req.params.username}/repos?
            per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}
            &client_secret=${config.get('githubSecret')}`,
            method: 'GET', 
            headers: { 'user-agent': 'node.js'}
        };
        //NOTE request() is used to send request to other platform or server 
        request(options, (error, response, body) => {
            if(error) console.error(error);

            //NOTE is it 200 response? if not return 404 
            if(response.statusCode !== 200){
                return res.status(400).json({msg: 'No Github profile found'});
            }
            res.json(JSON.parse(body));
        } 
        
        
        ) 
        
    }catch(err){
        console.error(err.message); 
        res.status(500).send('Server Error');
    }
})


module.exports = router;




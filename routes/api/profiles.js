const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); //NOTE used to verify token and response user.id
const { check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

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

//ANCHOR @route GET api/profile
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
//ANCHOR Build social object 
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
    //ANCHOR Create
    profile = new Profile(profileFields);
    await profile.save(); 
     res.json(profile)
    

}catch(err){
    res.status(500).send('Server Error oe');

}


})

module.exports = router;




const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); 

const connectDB = async () => {
    try{
        await mongoose.connect(db,{
            useNewUrlParser:true,
            useUnifiedTopology: true,
            useCreateIndex:true,
            useFindAndModify: false
        });
        
        console.log('MongoDB Connected...');

    } catch(err) { //NOTE Catch an error if can not connect to mongo
        console.error(err.message);
        //NOTE escape(exit) from process with failure
        process.exit(1);
    }

}

module.exports = connectDB;
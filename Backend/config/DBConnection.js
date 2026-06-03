const mongoose = require("mongoose")

require('dotenv').config();

const connectDB =async()=> {
    try {
        await mongoose.connect(
            process.env.MONGODB,
        );
        console.log("DataBase is Connected")
    } catch (error) {
        console.log(error);
        
    }
}
module.exports = connectDB;
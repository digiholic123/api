const mongoose = require('mongoose');

const reqOnOffSchema = new mongoose.Schema({
        dayNumber : {
            type: Number,
            required: true
        },
        dayName : {
            type: String,
            required: true
        },
        message:{
            type: String,
            required: true
        },
        enabled:{
            type: Boolean,
            required: true
        },
        updatedAt:{
            type: String,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('reqONoFF', reqOnOffSchema);
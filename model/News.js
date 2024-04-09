const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
        Description: {
            type: String,
            required: true
        },
        modified:{
            type: Date,
            default: Date.now()
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('news', newsSchema);

const mongoose = require('mongoose');

const walletContactSchema = new mongoose.Schema({
        number: {
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

module.exports = mongoose.model('walletContact', walletContactSchema);

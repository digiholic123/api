const mongoose = require('mongoose');

const revert_payment_history = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        providerId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        gameTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        username:{
            type: String,
            required: true
        },
        mobileNumber:{
            type: String,
            required: true
        },
        providerName: {
            type: String,
            required: true
        }, 
        gameTypeName:{
            type: String,
            required: true
        },
        wallet_bal_before:{
            type: Number,
            required: true
        },
        wallet_bal_after:{
            type: Number,
            required: true
        },
        revert_amount:{
            type: Number,
            required: true
        },
        date:{
            type: String,
            required: true
        },
        dateTime:{
            type: String,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('revert_payment', revert_payment_history);
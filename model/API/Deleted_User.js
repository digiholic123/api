const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    password:{
        type: String,
        required: false
    },
    username:{
        type: String,
        required: false
    },
    role:{
        type: String,
        required: false
    },
    mobile:{
        type: String,
        required: false
    },
    firebaseId:{
        type: String,
        required: false
    },
    deviceName: {
        type: String,
        required: false
    },
    deviceId:{
        type: String,
        required: false,
        unique: false
    },
    wallet_balance:{
        type: Number,
        required: false
    },
    wallet_bal_updated_at:{
        type: String,
        required: false
    },
    mpin:{
        type: String,
        required: false
    },
    register_via:{
        type: Number,
        required: false
        //1 : registered from android, 2 : registered from web
    },
    mpinOtp:{
        type: Number,
        required: false
    },
    deviceVeriOTP:{
        type: Number,
        required: false
    },
    CreatedAt: {
        type: String,
        required: false
    },
    Deleted_At: {
        type: String,
        required: false
    },
    deleteRsn:{
        type: String,
        required: false
    },
    mainNotification: {
        type: Boolean,
        required: false
    },
    gameNotification: {
        type: Boolean,
        required: false
    },
    starLineNotification: {
        type: Boolean,
        required: false
    },
    andarBaharNotification: {
        type: Boolean,
        required: false
    }
},
{
  versionKey : false
});

userSchema.plugin(dataTables);
module.exports = mongoose.model('Deleted_User', userSchema);
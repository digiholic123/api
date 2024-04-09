const fundReq = require('../../model/API/FundRequest');
const users = require('../../model/API/Users');
const gcm = require('node-gcm');
const dateTime = require('node-datetime');
// const sender = new gcm.Sender('AAAAz-Vezi4:APA91bHNVKatfjZiHl13fcF1xzWK5pLOixdZlHE8KVRwIxVHLJdWGF973uErxgjL_HkzzD1K7a8oxgfjXp4StlVk_tNOTYdFkSdWe6vaKw6hVEDdt0Dw-J0rEeHpbozOMXd_Xlt-_dM1');
const sender = new gcm.Sender(process.env.FIREBASE_SENDER_KEY);
module.exports = async function (data) {
    try
    {
        if (process.env.pm_id == '0') 
        {    
            const dt = dateTime.create();
            const reqDate = dt.format('d/m/Y');
            const userId = await fundReq.find({reqStatus: "Declined", reqDate: reqDate }, {userId: 1, reqStatus : 1, reqType:1, reqAmount: 1, username : 1});

            if(userId)
            {
                for(index in userId){
                    let id = userId[index].userId
                    let userToken = [];
                    let userFirebase = await users.findOne({ _id: id, mainNotification : true}, {firebaseId: 1});
                    let token = userFirebase.firebaseId;
                    userToken.push(token);
                    let body = "Your "+ userId[index].reqType + " Request Of Rs "+ userId[index].reqAmount + "/- Is Auto Expired" ;
                    var message = new gcm.Message({
                        priority: 'high',             
                        data: {
                            body : "Credit/Debit Request Notification",
                            icon : "ic_launcher",
                            title: body,
                            type : "Wallet"
                        }
                    });
                    sender.send(message, { registrationTokens: userToken }, function (err, response) {
                        // if (err) throw err;
                        // else console.log(response);
                    });
                }
            }
        }
    }
    catch (e) {
        console.log(e);
        return e;
    }
};
const gcm = require('node-gcm');
// const sender = new gcm.Sender('AAAAz-Vezi4:APA91bHNVKatfjZiHl13fcF1xzWK5pLOixdZlHE8KVRwIxVHLJdWGF973uErxgjL_HkzzD1K7a8oxgfjXp4StlVk_tNOTYdFkSdWe6vaKw6hVEDdt0Dw-J0rEeHpbozOMXd_Xlt-_dM1');
const sender = new gcm.Sender(process.env.FIREBASE_SENDER_KEY);

module.exports = async function (userToken, title, body) {

    let token = userToken;
    let notificationTitle = title;
    let notificationBody = body;

    var message = new gcm.Message({
            priority: 'high',             
            data: {
                title: notificationTitle,
                icon: "ic_launcher",
                body: notificationBody,
                type: "Wallet"
            }
        });

    // console.log(message);

    sender.send(message, { registrationTokens: token }, function (err, response) {
        // if (err) throw err;
        // else console.log(response) ;
    });
};
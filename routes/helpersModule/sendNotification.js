const user = require('../../model/API/Users');
const chunks = require('array.chunk');
const gcm = require('node-gcm');
// const sender = new gcm.Sender('AAAAz-Vezi4:APA91bHNVKatfjZiHl13fcF1xzWK5pLOixdZlHE8KVRwIxVHLJdWGF973uErxgjL_HkzzD1K7a8oxgfjXp4StlVk_tNOTYdFkSdWe6vaKw6hVEDdt0Dw-J0rEeHpbozOMXd_Xlt-_dM1');
const sender = new gcm.Sender(process.env.FIREBASE_SENDER_KEY);

module.exports = async function (req, res, sumDgit, uesrtoken) {
    try
    {
        const x = req.body.gameId;
        const str = req.body.providerId;
        let data = '';
        let name = '';
        if(str){ data = str.split("|");   name = data[1];}
        let winningDigit = sumDgit;
        let title = '';
        let body = '';
        let token = uesrtoken;
        let notificationType = '';
        switch(x) {
            case '1':
                token = await user.find({ banned : false, andarBaharNotification: true }, {firebaseId : 1,_id:0});
                title = winningDigit;
                body = name; 
                notificationType = "Result";
                break;
            case '2':
                token = await user.find({ banned : false, starLineNotification: true }, {firebaseId : 1,_id:0});;
                title = winningDigit;
                body = name;              
                notificationType = "Result";
                break;
            case '3':
                token = await user.find({ banned : false, gameNotification: true }, {firebaseId : 1,_id:0});;
                title = winningDigit;
                body = name;              
                notificationType = "Result";
              
                break;
            case '4':
                token = await user.find({ banned : false, mainNotification: true }, {firebaseId : 1,_id:0});
                title = req.body.message;
                body = req.body.title;
                notificationType = "Notification";
                break;
            default : 
                body  = 'Congrats For Your '+ winningDigit +' Game Win';
                title = 'Points Successfully Credited To Your Wallet For '+ winningDigit  +' Win';
                notificationType = "Wallet";
                break;
            }

            var message = new gcm.Message({
                priority: 'high',
                data: {
                    title: title,
                    icon: "ic_launcher",
                    body: body,
                    type: notificationType
                }
            });
            let length  = token.length;
            if(length > 1000){
                const userToken = token.map(token => token.firebaseId); 
                console.log(userToken,'if condition')
                token = chunks(userToken, 1000);
                let newLength = token.length;
                for(j = 0 ; j < newLength; j++)
                {
                    let tokenArr = token[j];
                   
                    sender.send(message, { registrationTokens: tokenArr }, function (err, response) {
                        if (err) console.log(err);
                        else console.log(response);
                    });
                }
            }
            else{
                const userToken = token.map(token => token.firebaseId); 
                console.log(userToken,'else condition')
                sender.send(message, { registrationTokens: userToken }, function (err, response) {
                    if (err) console.log(err,'error');
                    else console.log(response) ;
                });
            }
        }
    catch (e) {
        console.log(e)
    //    return e;
    }
};

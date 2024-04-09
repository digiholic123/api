const router = require("express").Router();
const Rules = require("../../model/appSetting/HowToPlay");
const Notice = require("../../model/appSetting/NoticeBoard");
const ProfileNote = require("../../model/appSetting/ProfileNote");
const WalletContact = require("../../model/appSetting/WalletContact");
const withDraw = require("../../model/withDrawMessage");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const version = require("../../model/dashBoard/AppVersion");
const moment = require('moment');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/apk/')
    },
    filename: function (req, file, cb) {
        let originalname = file.originalname;
        let ext = originalname.split('.')[1];
        let filename = `${file.fieldname}-${Date.now()}.${ext}`;
      cb(null, filename)
    }
  });
  
const upload = multer({ storage: storage })


router.get("/HTP", session, permission, async (req, res) => {
  const find = await Rules.find();
  const userInfo = req.session.details;
  const permissionArray = req.view;

  //Changes by dev007
  if(find[0].howtoplay == null || find[0].howtoplay == undefined || find[0].howtoplay.length==0 ){
     const element = {videoUrl:'', title:'', description:''}
     await Rules.updateOne({_id:find[0]._id} ,  { $push : { howtoplay :element} });
     find[0].howtoplay = [ element ];
  }
 
  const check = permissionArray["howToPlay"].showStatus;
  if (check === 1) {
    res.render("./appSettings/howToPlay", {
      data: find,
      userInfo: userInfo,
      permission: permissionArray,
      title: "How To Play"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.get("/withDraw", session, permission, async (req, res) => {
  const find = await withDraw.findOne();
  const userInfo = req.session.details;
  const permissionArray = req.view;

  const check = permissionArray["howToPlay"].showStatus;
  if (check === 1) {
    res.render("./appSettings/withDraw", {
      data: find,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Withdraw Screen"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.post("/updateWithdraw", session, async (req, res) => {
  try {
    const pri_title = req.body.pri_title;
    const sec_title = req.body.sec_title;
    const number = req.body.number;
    const timing = req.body.timing;
    const id = req.body.id;
    const filter = { _id: id };
    const update = {
      textMain: pri_title,
      textSecondry: sec_title,
      Number: number,
      Timing: timing
    };

    let doc = await withDraw.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    });

    res.status(200).json(doc);
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

router.post("/update", session, async (req, res) => {
  try {
    const updateUser = await Rules.findByIdAndUpdate(req.body.id, { howtoplay: req.body.data }, { new: true });
    console.log(updateUser)
    res.status(200).json(updateUser);
  } catch (e) {
    res.json(e);
  }
});

router.get("/noticeBoard", session, permission, async (req, res) => {
  const find = await Notice.find();
  const userInfo = req.session.details;
  const permissionArray = req.view;

  const check = permissionArray["noticeBoard"].showStatus;
  if (check === 1) {
    res.render("./appSettings/noticeBoard", {
      data: find,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Notice Board"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.post("/updateNotice", session, async (req, res) => {
  try {
    await Notice.updateOne(
      { _id: req.body.id },
      {
        $set: {
          title1: req.body.title1,
          title2: req.body.title2,
          title3: req.body.title3,
          description1: req.body.desc1,
          description2: req.body.desc2,
          description3: req.body.desc3,
          contact: req.body.contact
        }
      }
    );
    const user = await Notice.findOne({ _id: req.body.id });
    res.status(200).json(user);
  } catch (e) {
    res.json(e);
  }
});

router.get("/profileNote", session, permission, async (req, res) => {
  const find = await ProfileNote.find();
  const userInfo = req.session.details;
  const permissionArray = req.view;
  const check = permissionArray["profileNote"].showStatus;

  if (check === 1) {
    res.render("./appSettings/profileNote", {
      data: find,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Profile Note"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.post("/updateProfileNote", session, async (req, res) => {
  try {
    await ProfileNote.updateOne(
      { _id: req.body.id },
      { $set: { note: req.body.note } }
    );
    const user = await ProfileNote.findOne({ _id: req.body.id });
    res.status(200).json(user);
  } catch (e) {
    res.json(e);
  }
});

router.get("/walletContact", session, permission, async (req, res) => {
  const find = await WalletContact.find();
  const userInfo = req.session.details;
  const permissionArray = req.view;

  const check = permissionArray["walletContact"].showStatus;
  if (check === 1) {
    res.render("./appSettings/walletContact", {
      data: find,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Wallet Contact"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.post("/updatewalletContact", session, async (req, res) => {
  try {
    await WalletContact.updateOne(
      { _id: req.body.id },
      { $set: { number: req.body.number } }
    );
    const user = await WalletContact.findOne({ _id: req.body.id });
    res.status(200).json(user);
  } catch (e) {
    res.json(e);
  }
});

router.get("/versionSetting", session, permission, async (req, res) => {
  
    const find = await version.findOne();
    const userInfo = req.session.details;
    const permissionArray = req.view;
  
    if (userInfo.role == 0) {
      res.render("./appSettings/version", {
        data: find,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Version Setting"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
});

router.post("/updateAppSet", session, upload.single('apk'), async (req, res) => {
    try {
        const file = req.file;
        const type = req.body.type;
        const time = moment().format("DD/MM/YYYY HH:MM:SS a");
        const id = req.body.id;
        let query = '';
        if(type == 1){

            const status = req.body.status;
            query = { forceUpdate : status, updatedOn : time }
            if (file && file.filename) {
              query['apkFileName'] = file.filename;
            }

        }
        else if(type == 2){
            const status = req.body.status;
            query = { maintainence : status, updatedOn : time }
            if (file && file.filename) {
              query['apkFileName'] = file.filename;
            }
        }
        else if(type == 3){
            const status = req.body.appVer;
            query = { appVersion : status, updatedOn : time }
            if (file && file.filename) {
              query['apkFileName'] = file.filename;
            }
        }

        console.log('query', query);

        const user =  await version.updateOne(
            { _id: id },
            { $set: query }
        );
            
        // res.status(200).json({
        //     status: 1,
        //     message: "Updated",
        //     data: user
        // });

        res.redirect("/appSettings/versionSetting");

    } catch (e) {
        console.log({
            status : 0,
            message : "Server Error",
            error : e
        })
      res.json(e);
    }
});

  module.exports = router;

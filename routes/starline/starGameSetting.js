const router = require("express").Router();
const starProvider = require("../../model/starline/Starline_Provider");
const starSettings = require("../../model/starline/AddSetting");
const dateTime = require("node-datetime");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");



// router.get("/web/startline", async (req, res) => {
//   try {
//     const id = "61fbd0cd41b0d43022cabf27";
//     // const id = req.query.userId;

//     let finalArr = {};
//     const provider1 = await starProvider.find().sort({ _id: 1 });
//     let finalNew = [];

//     console.log("provider" ,provider1);
    
//     for (index in provider1) {
//       let id = provider1[index]._id;
//       // let id = mongoose.Types.ObjectId(provider1[index]._id);


//       const settings = await starSettings
//         .find({ providerId: id })
//         .sort({ _id: 1 });
//       finalArr[id] = {
//         _id: id,
//         providerName: provider1[index].providerName,
//         providerResult: provider1[index].providerResult,
//         modifiedAt: provider1[index].modifiedAt,
//         resultStatus: provider1[index].resultStatus,
//         gameDetails: settings,
//       };
//     }

//     for (index2 in finalArr) {
//       let data = finalArr[index2];
//       finalNew.push(data);
//     }
//  console.log("finalNew" ,finalNew)
//     res.send({ data: finalNew, status: true });
//   } catch (e) {
//     res.json({ message: e });
//   }
// });

router.get("/", session, permission, async (req, res) => {
  try {
    const id = req.query.userId;
    const userInfo = req.session.details;
    const permissionArray = req.view;
    let finalArr = {};
    const provider = await starProvider.find().sort({ _id: 1 });
    let finalNew = [];

    for (index in provider) {
      let id = provider[index]._id;
      const settings = await starSettings
        .find({ providerId: id })
        .sort({ _id: 1 });
      finalArr[id] = {
        _id: id,
        providerName: provider[index].providerName,
        providerResult: provider[index].providerResult,
        modifiedAt: provider[index].modifiedAt,
        resultStatus: provider[index].resultStatus,
        gameDetails: settings,
      };
    }

    for (index2 in finalArr) {
      let data = finalArr[index2];
      finalNew.push(data);
    }

    if (id == 123456) {
      return res.json(finalNew);
    }

    const check = permissionArray["starlineSetting"].showStatus;
    if (check === 1) {
      res.render("./starline/starlinegamesetting", {
        data: finalNew,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Starline Game Setting",
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard",
      });
    }
  } catch (e) {
    res.json({ message: e });
  }
});

router.get("/addSetting", session, permission, async (req, res) => {
  try {
    const provider = await starProvider.find().sort({ _id: 1 });
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["starlineSetting"].showStatus;
    if (check === 1) {
      res.render("./starline/starlineaddsetting", {
        data: provider,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Starline Add Setting",
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard",
      });
    }
  } catch (e) {
    res.json({ message: e });
  }
});

router.post("/updateProviderSettings", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");

    const updateUser = await starSettings.updateMany(
      { providerId: req.body.providerId },
      {
        $set: {
          OBT: req.body.obtTime,
          CBT: req.body.cbtTime,
          OBRT: req.body.obrtTime,
          isClosed: req.body.openClose,
          modifiedAt: formatted,
        },
      }
    );
    res.redirect("/starlinegamesetting");
  } catch (e) {
    res.redirect("./starline/starlinemultiedit");
  }
});

router.patch("/", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    const updateUser = await starSettings.updateOne(
      { _id: req.body.id },
      {
        $set: {
          OBT: req.body.obt,
          CBT: req.body.cbt,
          OBRT: req.body.obrt,
          isClosed: req.body.close,
          modifiedAt: formatted,
        },
      }
    );
    res.redirect("/starlinegamesetting");
  } catch (e) {
    res.json(e);
  }
});

router.post("/insertSettings", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    const providerId = req.body.gameid;
    const gameDay = req.body.gameDay;
    const find = await starSettings.findOne({
      providerId: providerId,
      gameDay: gameDay,
    });
    if (!find) {
      const settings = new starSettings({
        providerId: req.body.gameid,
        gameDay: req.body.gameDay,
        OBT: req.body.game1,
        CBT: req.body.game2,
        OBRT: req.body.game3,
        isClosed: req.body.status,
        modifiedAt: formatted,
      });
      await settings.save();
      res.json({
        status: 1,
        message: "Successfully Inserted Timings For " + gameDay,
      });
    } else {
      res.json({
        status: 1,
        message: "Details Already Filled For " + gameDay,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/:providerId", session, permission, async (req, res) => {
  try {
    const id = req.params.providerId;
    let findMultiple;
    findMultiple = await starSettings.find({ providerId: id });
    const userInfo = req.session.details;
    const permissionArray = req.view;

    if (Object.keys(findMultiple).length === 0) {
      findMultiple = "Epmty";
    }

    const check = permissionArray["starlineSetting"].showStatus;
    if (check === 1) {
      res.render("./starline/starlinemultiedit", {
        data: findMultiple,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Starline Multi Edit",
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard",
      });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;

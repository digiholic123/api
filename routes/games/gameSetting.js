const router = require("express").Router();
const dateTime = require("node-datetime");
const mongoose = require("mongoose");
const gamesProvider = require("../../model/games/Games_Provider");
const gamesSetting = require("../../model/games/AddSetting");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/web/games", async (req, res) => {
  try {
    const id = mongoose.Types.ObjectId("61fbd0cd41b0d43022cabf27");
    const userInfo = req.session.details;
    const permissionArray = req.view;
    let finalArr = {};
    const provider = await gamesProvider.find().sort({ _id: 1 });
    let finalNew = [];

    for (index in provider) {
      let id = mongoose.Types.ObjectId(provider[index]._id);
      const settings = await gamesSetting
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

    res.send({ data: finalNew, status: true });

    if (id == 123456) {
      return res.json(finalNew);
    }

    //   res.render("./games/gamesetting", {
    // 	data: finalNew,
    // 	userInfo: userInfo,
    // 	permission: permissionArray,
    // 	title: "Game Settings",
    //   });
  } catch (e) {
    res.json({ message: e });
  }
});

router.get("/", session, permission, async (req, res) => {
  try {
    const id = req.query.userId;
    const userInfo = req.session.details;
    const permissionArray = req.view;
    let finalArr = {};
    const provider = await gamesProvider.find().sort({ _id: 1 });
    let finalNew = [];

    for (index in provider) {
      let id = provider[index]._id;
      const settings = await gamesSetting
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

    res.render("./games/gamesetting", {
      data: finalNew,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Game Settings",
    });
  } catch (e) {
    res.json({ message: e });
  }
});

router.post("/insertSettings", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    const providerId = req.body.gameid;
    const gameDays = req.body.gameDay;

    let result;
    let promiseArr = [];
    for (let day of gameDays) {
      const find = await gamesSetting.findOne({
        providerId: providerId,
        gameDay: day,
      });
      console.log(find, "game settings result");
      if (!find) {
        const settings = new gamesSetting({
          providerId: providerId,
          gameDay: day,
          OBT: req.body.game1.toString(),
          CBT: req.body.game2.toString(),
          OBRT: req.body.game3.toString(),
          CBRT: req.body.game4.toString(),
          isClosed: req.body.status,
          modifiedAt: formatted,
        });
        promiseArr.push(await settings.save());
      }
    }

    result = await Promise.all(promiseArr);

    if (result) {
      res.json({
        status: 1,
        message: "Successfully Inserted Timings For " + gameDays.join(),
      });
    } else {
      res.json({
        status: 1,
        message: "Details Already Filled For " + gameDays.join(),
      });
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get("/addSetting", session, permission, async (req, res) => {
  try {
    const provider = await gamesProvider.find().sort({ _id: 1 });
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["gamesSetting"].showStatus;
    if (check === 1) {
      res.render("./games/addSetting", {
        data: provider,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Game Setting",
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard",
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ message: e });
  }
});

router.patch("/", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    await gamesSetting.updateOne(
      { _id: req.body.id },
      {
        $set: {
          OBT: req.body.obt,
          CBT: req.body.cbt,
          OBRT: req.body.obrt,
          CBRT: req.body.cbrt,
          isClosed: req.body.close,
          modifiedAt: formatted,
        },
      }
    );
    res.redirect("/gamesSetting");
  } catch (e) {
    res.json(e);
  }
});

router.post("/updateAll", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");

    await gamesSetting.updateMany(
      { providerId: req.body.providerId },
      {
        $set: {
          OBT: req.body.obtTime,
          CBT: req.body.cbtTime,
          OBRT: req.body.obrtTime,
          CBRT: req.body.cbrtTime,
          isClosed: req.body.openClose,
          modifiedAt: formatted,
        },
      }
    );
    res.redirect("/gamesSetting");
  } catch (e) {
    res.redirect("./games/multiedit");
  }
});

router.post("/:providerId", session, permission, async (req, res) => {
  try {
    const id = mongoose.Types.ObjectId(req.params.providerId);
    const userInfo = req.session.details;
    const permissionArray = req.view;
    gamesProvider.aggregate(
      [
        { $match: { _id: id } },
        {
          $lookup: {
            from: "games_settings",
            localField: "_id",
            foreignField: "providerId",
            as: "gameDetails",
          },
        },
      ],
      function (error, result) {
        if (error) throw error;
        else {
          const check = permissionArray["gamesSetting"].showStatus;
          if (check === 1) {
            res.render("./games/multiedit", {
              data: result,
              userInfo: userInfo,
              permission: permissionArray,
              title: "Edit Multiple",
            });
          } else {
            res.render("./dashboard/starterPage", {
              userInfo: userInfo,
              permission: permissionArray,
              title: "Dashboard",
            });
          }
        }
      }
    );
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;

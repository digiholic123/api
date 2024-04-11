const router = require("express").Router();
const WalletContact = require("../../model/appSetting/WalletContact");
const gamesProvider = require("../../model/games/Games_Provider");
const gamesSetting = require("../../model/games/AddSetting");
const gameResult = require("../../model/games/GameResult");
const starProvider = require("../../model/starline/Starline_Provider");
const starSettings = require("../../model/starline/AddSetting");
const gameList = require("../../model/games/GameList");
const mongoose = require("mongoose");
router.get("/web/walletContact", async (req, res) => {
  try {
    const response = await WalletContact.aggregate([
      {
        $project: { number: 1 },
      },
    ]);
    res.send({ status: true, data: response });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
});
router.get("/web/allgames", async (req, res) => {
  try {
    const provider = await gamesProvider.find().sort({ _id: 1 });
    res.send({ data: provider });
  } catch (e) {
    res.json({ message: e });
  }
});
router.get("/web/games", async (req, res) => {
  try {
    const id = mongoose.Types.ObjectId("61fbd0cd41b0d43022cabf27");
    const userInfo = req.session.details;
    const permissionArray = req.view;
    let finalArr = {};
    const provider = await gamesProvider.find({}).sort({ _id: 1 });
    console.log("provider" ,provider)
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
  } catch (e) {
    res.json({ message: e });
  }
});
router.get("/web/gameresult", async (req, res) => {
  try {
    const name = "TIME BAZAR"; // Example name to filter by
    // const name = req.query.name; // Uncomment this line if you want to filter by query parameter
    const provider = await gamesProvider.find().sort({ _id: 1 });
    const result = await gameResult.find().sort({ _id: -1 });
    const groupedData = await result.reduce((acc, item) => {
      const key = item.providerName.toUpperCase();
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});
    const filteredData = await Object.fromEntries(
      Object.entries(groupedData).filter(([key]) =>
        key
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(name.toLowerCase().replace(/\s+/g, ""))
      )
    );
    const flattenedData = Object.values(filteredData).flat();
    const groupedByDate = {};
    flattenedData.forEach((item) => {
      const resultDate = item.resultDate;
      if (!groupedByDate[resultDate]) {
        groupedByDate[resultDate] = [];
      }
      groupedByDate[resultDate].push(item);
    });
    const groupedData1 = Object.entries(groupedByDate).map(
      ([resultDate, items]) => ({
        resultDate,
        data: items,
      })
    );
    res.send({ data: groupedData1, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message, // Use e.message to get the error message
    });
  }
});
router.get("/web/startline", async (req, res) => {
  try {
    const id = "61fbd0cd41b0d43022cabf27";
    // const id = req.query.userId;
    let finalArr = {};
    const provider1 = await starProvider.find().sort({ _id: 1 });
    let finalNew = [];
    console.log("provider", provider1);
    for (index in provider1) {
      let id = provider1[index]._id;
      // let id = mongoose.Types.ObjectId(provider1[index]._id);
      const settings = await starSettings
        .find({ providerId: id })
        .sort({ _id: 1 });
      finalArr[id] = {
        _id: id,
        providerName: provider1[index].providerName,
        providerResult: provider1[index].providerResult,
        modifiedAt: provider1[index].modifiedAt,
        resultStatus: provider1[index].resultStatus,
        gameDetails: settings,
      };
    }
    for (index2 in finalArr) {
      let data = finalArr[index2];
      finalNew.push(data);
    }
    console.log("finalNew", finalNew);
    res.send({ data: finalNew, status: true });
  } catch (e) {
    res.json({ message: e });
  }
});
router.get("/web/gamerates", async (req, res) => {
  try {
    const provider = await gameList.find().sort({ _id: 1 });
    res.send({ data: provider });
  } catch (e) {
    return res.json({ message: e });
  }
});
module.exports = router;
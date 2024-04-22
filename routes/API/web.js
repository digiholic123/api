const router = require("express").Router();
const WalletContact = require("../../model/appSetting/WalletContact");
const gamesProvider = require("../../model/games/Games_Provider");
const gamesSetting = require("../../model/games/AddSetting");
const gameResult = require("../../model/games/GameResult");
const starline_game_Result = require("../../model/starline/GameResult");
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

    let finalNew = [];

    for (index in provider) {
      let id = mongoose.Types.ObjectId(provider[index]._id);
      const settings = await gamesSetting.find({ providerId: id })
        .sort({ _id: 1 });

      finalArr[id] = {
        _id: id,
        providerName: provider[index].providerName,
        providerResult: provider[index].providerResult,
        modifiedAt: provider[index].modifiedAt,
        resultStatus: provider[index].resultStatus,
        activeStatus: provider[index].activeStatus,
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

router.post("/web/panachart", async (req, res) => {
  try {
    // const name = "10:00 AM";
    const name = req.body.name;

    const provider = await gamesProvider.find().sort({ _id: 1 });
    const result = await gameResult.find().sort({ _id: -1 });

    const groupedData = result.reduce((acc, item) => {
      const key = item.providerName.toLowerCase().replace(/\s+/g, "");
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});

    const filteredData = Object.fromEntries(
      Object.entries(groupedData).filter(([key]) =>
        key
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(name.toLowerCase().replace(/\s+/g, ""))
      )
    );

    const flattenedData = Object.values(filteredData).flat();
    const groupedByWeek = {};

    flattenedData.forEach((item) => {
      const resultDate = new Date(item.resultDate);
      const weekStartDate = getMondayOfWeek(resultDate);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      const weekNumber = getWeekNumber(weekStartDate);
      if (!groupedByWeek[weekNumber]) {
        groupedByWeek[weekNumber] = {
          items: [],
          startDate: weekStartDate,
          endDate: weekEndDate,
        };
      }
      groupedByWeek[weekNumber].items.push(item);
    });

    const groupedDataByWeek = Object.entries(groupedByWeek).map(
      ([weekNumber, { items, startDate, endDate }]) => ({
        startDate: startDate,
        endDate: endDate,
        data: items.sort((a, b) => {
          const dateA = new Date(a.resultDate);
          const dateB = new Date(b.resultDate);
          return dateA - dateB;
        }),
      })
    );

    console.log("groupedDataByWeek", groupedDataByWeek.data);

    res.send({ data: groupedDataByWeek, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});
// router.post("/web/panachart", async (req, res) => {
//   // try {
//   //   const name = "TIME BAZAR"; // Example name to filter by
//   //   // const name = req.body.name;

//   //   const provider = await gamesProvider.find().sort({ _id: 1 });
//   //   const result = await gameResult.find().sort({ _id: -1 });

//   //   const groupedData = await result.reduce((acc, item) => {
//   //     const key = item.providerName.toUpperCase();
//   //     acc[key] = [...(acc[key] || []), item];
//   //     return acc;
//   //   }, {});

//   //   const filteredData = await Object.fromEntries(
//   //     Object.entries(groupedData).filter(([key]) =>
//   //       key
//   //         .toLowerCase()
//   //         .replace(/\s+/g, "")
//   //         .includes(name.toLowerCase().replace(/\s+/g, ""))
//   //     )
//   //   );

//   //   const flattenedData = Object.values(filteredData).flat();
//   //   const groupedByWeek = {};
//   //   flattenedData.forEach((item) => {
//   //     const resultDate = new Date(item.resultDate);
//   //     const weekNumber = getWeekNumber(resultDate);
//   //     if (!groupedByWeek[weekNumber]) {
//   //       groupedByWeek[weekNumber] = [];
//   //     }
//   //     groupedByWeek[weekNumber].push(item);
//   //   });

//   //   const groupedDataByWeek = Object.entries(groupedByWeek).map(
//   //     ([weekNumber, items]) => ({
//   //       weekNumber,
//   //       data: items.sort((a, b) => {
//   //         const dateA = new Date(a.resultDate);
//   //         const dateB = new Date(b.resultDate);
//   //         return dateA - dateB;
//   //       }),
//   //     })
//   //   );

//   //   res.send({ data: groupedDataByWeek, status: true });
//   // } catch (e) {
//   //   res.json({
//   //     status: 0,
//   //     message: e.message,
//   //   });
//   // }

//   try {
//     const name = req.body.name;

//     const provider = await gamesProvider.find().sort({ _id: 1 });
//     const result = await gameResult.find().sort({ _id: -1 });

//     const groupedData = result.reduce((acc, item) => {
//       const key = item.providerName.toUpperCase();
//       acc[key] = [...(acc[key] || []), item];
//       return acc;
//     }, {});

//     const filteredData = Object.fromEntries(
//       Object.entries(groupedData).filter(([key]) =>
//         key
//           .toLowerCase()
//           .replace(/\s+/g, "")
//           .includes(name.toLowerCase().replace(/\s+/g, ""))
//       )
//     );

//     const flattenedData = Object.values(filteredData).flat();
//     const groupedByWeek = {};
//     flattenedData.forEach((item) => {
//       const resultDate = new Date(item.resultDate);
//       const weekNumber = getMondayOfWeek(resultDate);
//       if (!groupedByWeek[weekNumber]) {
//         groupedByWeek[weekNumber] = {
//           items: [],
//           startDate: null,
//           endDate: null,
//         };
//       }
//       groupedByWeek[weekNumber].items.push(item);
//       if (
//         !groupedByWeek[weekNumber].startDate ||
//         resultDate < groupedByWeek[weekNumber].startDate
//       ) {
//         groupedByWeek[weekNumber].startDate = resultDate;
//       }
//       if (
//         !groupedByWeek[weekNumber].endDate ||
//         resultDate > groupedByWeek[weekNumber].endDate
//       ) {
//         groupedByWeek[weekNumber].endDate = resultDate;
//       }
//     });

//     Object.values(groupedByWeek).forEach((week) => {
//       week.endDate = new Date(week.startDate);
//       week.endDate.setDate(week.endDate.getDate() + 6);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => ({
//         weekNumber,
//         startDate: startDate.toISOString(),
//         endDate: endDate.toISOString(),
//         data: items.sort((a, b) => {
//           const dateA = new Date(a.resultDate);
//           const dateB = new Date(b.resultDate);
//           return dateA - dateB;
//         }),
//       })
//     );

//     res.send({ data: groupedDataByWeek, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

router.post("/web/jodichart", async (req, res) => {
  // try {
  //   const name = req.body.name;
  //   // const name = "TIME BAZAR"; // Example name to filter by

  //   const provider = await gamesProvider.find().sort({ _id: 1 });
  //   const result = await gameResult.find().sort({ _id: -1 });

  //   const groupedData = result.reduce((acc, item) => {
  //     const key = item.providerName.toUpperCase();
  //     acc[key] = [...(acc[key] || []), item];
  //     return acc;
  //   }, {});

  //   const filteredData = Object.fromEntries(
  //     Object.entries(groupedData).filter(([key]) =>
  //       key
  //         .toLowerCase()
  //         .replace(/\s+/g, "")
  //         .includes(name.toLowerCase().replace(/\s+/g, ""))
  //     )
  //   );

  //   const flattenedData = Object.values(filteredData).flat();
  //   const groupedByWeek = {};
  //   flattenedData.forEach((item) => {
  //     const resultDate = new Date(item.resultDate);
  //     const weekNumber = getWeekNumber(resultDate);
  //     if (!groupedByWeek[weekNumber]) {
  //       groupedByWeek[weekNumber] = {
  //         items: [],
  //         startDate: null,
  //         endDate: null,
  //       };
  //     }
  //     groupedByWeek[weekNumber].items.push({
  //       providerId: item.providerId,
  //       providerName: item.providerName,
  //       session: item.session,
  //       resultDate: item.resultDate,
  //       winningDigitFamily: item.winningDigitFamily,
  //     });
  //     if (
  //       !groupedByWeek[weekNumber].startDate ||
  //       resultDate < groupedByWeek[weekNumber].startDate
  //     ) {
  //       groupedByWeek[weekNumber].startDate = resultDate;
  //     }
  //     if (
  //       !groupedByWeek[weekNumber].endDate ||
  //       resultDate > groupedByWeek[weekNumber].endDate
  //     ) {
  //       groupedByWeek[weekNumber].endDate = resultDate;
  //     }
  //   });

  //   Object.values(groupedByWeek).forEach((week) => {
  //     week.endDate = new Date(week.startDate);
  //     week.endDate.setDate(week.endDate.getDate() + 6); // Add 6 days to get the end of the week
  //   });

  //   const groupedDataByWeek = Object.entries(groupedByWeek).map(
  //     ([weekNumber, { items, startDate, endDate }]) => ({
  //       weekNumber,
  //       startDate: startDate.toISOString(),
  //       endDate: endDate.toISOString(), // Convert dates to ISO string format
  //       data: items.sort((a, b) => {
  //         const dateA = new Date(a.resultDate);
  //         const dateB = new Date(b.resultDate);
  //         return dateA - dateB;
  //       }),
  //     })
  //   );

  //   res.send({ data: groupedDataByWeek, status: true });
  // } catch (e) {
  //   res.json({
  //     status: 0,
  //     message: e.message,
  //   });
  // }

  try {
    // const name = "10:00 AM";
    // const name = "TIME BAZAR"; // Example name to filter by
    const name = req.body.name;

    const provider = await gamesProvider.find().sort({ _id: 1 });
    const result = await gameResult.find().sort({ _id: -1 });

    const groupedData = result.reduce((acc, item) => {
      const key = item.providerName.toLowerCase().replace(/\s+/g, "");
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});

    const filteredData = Object.fromEntries(
      Object.entries(groupedData).filter(([key]) =>
        key
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(name.toLowerCase().replace(/\s+/g, ""))
      )
    );

    const flattenedData = Object.values(filteredData).flat();
    const groupedByWeek = {};

    flattenedData.forEach((item) => {
      const resultDate = new Date(item.resultDate);
      const weekStartDate = getMondayOfWeek(resultDate);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      const weekNumber = getWeekNumber(weekStartDate);
      if (!groupedByWeek[weekNumber]) {
        groupedByWeek[weekNumber] = {
          items: [],
          startDate: weekStartDate,
          endDate: weekEndDate,
        };
      }
      groupedByWeek[weekNumber].items.push(item);
    });

    const groupedDataByWeek = Object.entries(groupedByWeek).map(
      ([weekNumber, { items, startDate, endDate }]) => ({
        startDate: startDate,
        endDate: endDate,
        data: items.sort((a, b) => {
          const dateA = new Date(a.resultDate);
          const dateB = new Date(b.resultDate);
          return dateA - dateB;
        }),
      })
    );

    console.log("groupedDataByWeek", groupedDataByWeek.data);

    res.send({ data: groupedDataByWeek, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});
router.get("/web/startline", async (req, res) => {
  try {
    let finalArr = {};
    const provider1 = await starProvider.find().sort({ providerName: 1 }); // Sort by providerName field

    for (let index in provider1) {
      let id = provider1[index]._id;
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

    let finalNew = Object.values(finalArr); // Convert object values to array

    res.send({ data: finalNew, status: true });
  } catch (e) {
    res.json({ message: e });
  }
});

router.post("/web/startline_pana_chart", async (req, res) => {
  try {
    // const name = "10:00 AM";
    const name = req.body.name;

    const provider = await starProvider.find().sort({ _id: 1 });
    const result = await starline_game_Result.find().sort({ _id: -1 });

    const groupedData = result.reduce((acc, item) => {
      const key = item.providerName.toLowerCase().replace(/\s+/g, "");
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});

    const filteredData = Object.fromEntries(
      Object.entries(groupedData).filter(([key]) =>
        key
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(name.toLowerCase().replace(/\s+/g, ""))
      )
    );

    const flattenedData = Object.values(filteredData).flat();
    const groupedByWeek = {};

    flattenedData.forEach((item) => {
      const resultDate = new Date(item.resultDate);
      const weekStartDate = getMondayOfWeek(resultDate);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      const weekNumber = getWeekNumber(weekStartDate);
      if (!groupedByWeek[weekNumber]) {
        groupedByWeek[weekNumber] = {
          items: [],
          startDate: weekStartDate,
          endDate: weekEndDate,
        };
      }
      groupedByWeek[weekNumber].items.push(item);
    });

    const groupedDataByWeek = Object.entries(groupedByWeek).map(
      ([weekNumber, { items, startDate, endDate }]) => ({
        startDate: startDate,
        endDate: endDate,
        data: items.sort((a, b) => {
          const dateA = new Date(a.resultDate);
          const dateB = new Date(b.resultDate);
          return dateA - dateB;
        }),
      })
    );

    console.log("groupedDataByWeek", groupedDataByWeek.data);

    res.send({ data: groupedDataByWeek, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
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

function getWeekNumber(date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const weekStart = 1; // 0 for Sunday, 1 for Monday
  let dayOfWeek = onejan.getDay() - weekStart;
  if (dayOfWeek < 0) dayOfWeek += 7;

  const startOfFirstWeek = onejan.getTime() - dayOfWeek * 86400000;
  const weekNumber = Math.ceil(
    ((date.getTime() - startOfFirstWeek) / 86400000 + 1) / 7
  );
  return weekNumber;
}

function getMondayOfWeek(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return day === 0 ? new Date(monday.setDate(monday.getDate() + 1)) : monday;
}

module.exports = router;

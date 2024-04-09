const router = require("express").Router();
const provider = require("../../model/games/Games_Provider");
const gameBids = require("../../model/games/gameBids");
const session = require("../helpersModule/session");
const digits = require("../../model/digits");
const result = require("../../model/games/GameResult");
const gameRate = require("../../model/games/GameList");
const sum = require("../../model/dashBoard/BidSumGames");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
	const find = await provider.find().sort({ _id: 1 });
	const userInfo = req.session.details;
	const permissionArray = req.view;

	const check = permissionArray["cg"].showStatus;
	if (check === 1) {
		res.render("./dashboard/occuttinggroup", {
			data: find,
			userInfo: userInfo,
			permission: permissionArray,
			title: "OC Cutting Group",
		});
	} else {
		res.render("./dashboard/starterPage", {
			userInfo: userInfo,
			permission: permissionArray,
			title: "Dashboard",
		});
	}
});

router.get("/finalOCGroup", session, permission, async (req, res) => {
	const find = await provider.find().sort({ _id: 1 });
	const userInfo = req.session.details;
	const permissionArray = req.view;
	const check = permissionArray["cg"].showStatus;
	if (check === 1) {
		res.render("./dashboard/finalOCcutting", {
			data: find,
			userInfo: userInfo,
			permission: permissionArray,
			title: "Final OC Cutting Group",
		});
	} else {
		res.render("./dashboard/starterPage", {
			userInfo: userInfo,
			permission: permissionArray,
			title: "Dashboard",
		});
	}
});

router.post("/getFinalCutting", async (req, res) => {
	try {
		const date = req.body.date;
		const providerId = req.body.providerId;
		const session = req.body.session;

		commonQuery(providerId, date, session)
			.then(async function (data) {
				let status = data.status;
				if (status != 0) {
					let panaSum = data.panaSum;
					let singleDigitSum = data.singleDigitSum;
					let panaArray = data.panaArray;
					let singleDigitArray = data.singleDigitArray;

					const allBidDataOC = await gameBids.find(
						{
							providerId: providerId,
							gameDate: date,
							$and: [
								{
									$or: [
										{ gameTypeName: "Jodi Digit" },
										{ gameTypeName: "Half Sangam Digits" },
										{ gameTypeName: "Full Sangam Digits" },
									],
								},
							],
						},
						{ bidDigit: 1, biddingPoints: 1, gameTypePrice: 1, gameSession: 1 }
					);

					const rate = await gameRate
						.find(
							{
								$and: [
									{
										$or: [
											{ gameName: "Single Pana" },
											{ gameName: "Double Pana" },
											{ gameName: "Triple Pana" },
										],
									},
								],
							},
							{ gameName: 1, gamePrice: 1, _id: 0 }
						)
						.sort({ gamePrice: 1 });
				
					let sp = rate[0]?.gamePrice;
					let dp = rate[1]?.gamePrice;
					let tp = rate[2]?.gamePrice;

					let jodiPrice = 10;

					for (index in allBidDataOC) {
						let bidDigit = allBidDataOC[index].bidDigit;
						let bidPoints = allBidDataOC[index].biddingPoints;
						let splitDigit = bidDigit.split("-");
						let digit = splitDigit[0];
						let length = splitDigit[0].length;

						if (length == 1 || length == 2) {
							singleDigitSum = singleDigitSum + bidPoints;
						} else {
							panaSum = panaSum + bidPoints;
						}
						switch (length) {
							case 1:
								singleDigitArray[digit]["biddingPoints"] += bidPoints;
								break;
							case 2:
								let char0 = parseInt(digit.charAt(0));
								singleDigitArray[char0]["biddingPoints"] += bidPoints;
								break;
							case 3:
								panaArray[digit]["biddingPoints"] += bidPoints;
								break;
						}
					}

					res.json({
						status: 1,
						message: "success",
						finalData: {
							singleDigitArray: singleDigitArray,
							panaArray: panaArray,
						},
						dataSum: { singleDigit: singleDigitSum, Pana: panaSum },
						price: {
							sp: sp,
							dp: dp,
							tp: tp,
							jodiPrice: jodiPrice,
						},
					});
				} else {
					res.status(200).json({
						status: 0,
						message: "No Data Found",
					});
				}
			})
			.catch(function (err) {
				console.log(err);
				res.status(400).json({
					status: 0,
					message: "Something Went Wrong Contact Support",
					error: err,
				});
			});
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			status: 0,
			messag: "Something Went Wrong Contact Support",
			Error: error,
		});
	}
});

router.post("/finalCloseCutingGroup", async (req, res) => {
	try {
		const date = req.body.date;
		const providerId = req.body.providerId;
		const session = req.body.session;

		const openResut = await result.findOne({
			providerId: providerId,
			session: "Open",
			resultDate: date,
		});

		if (openResut) {
			let resultSingleDigit = parseInt(openResut.winningDigitFamily);
			let resultpanaDigit = parseInt(openResut.winningDigit);

			const rate = await gameRate
				.find(
					{
						$and: [
							{
								$or: [
									{ gameName: "Single Pana" },
									{ gameName: "Double Pana" },
									{ gameName: "Triple Pana" },
								],
							},
						],
					},
					{ gameName: 1, gamePrice: 1, _id: 0 }
				)
				.sort({ gamePrice: 1 });
			let sp = rate[0].gamePrice;
			let dp = rate[1].gamePrice;
			let tp = rate[2].gamePrice;

			commonQuery(providerId, date, session)
				.then(async function (data) {
					let panaSum = data.panaSum;
					let singleDigitSum = data.singleDigitSum;
					let panaArray = data.panaArray;
					let singleDigitArray = data.singleDigitArray;

					const allBidDataOC = await gameBids.find(
						{
							providerId: providerId,
							gameDate: date,
							$and: [
								{
									$or: [
										{ gameTypeName: "Jodi Digit" },
										{ gameTypeName: "Full Sangam Digits" },
										{ gameTypeName: "Half Sangam Digits" },
									],
								},
							],
						},
						{ bidDigit: 1, biddingPoints: 1, gameTypePrice: 1, gameSession: 1 }
					);

					const sumhf = await sum.findOne({
						providerId: providerId,
						date: date,
					});

					let jodiPrice = 10;
					let halfSangamTotal = sumhf.half_Sangamsum;
					let fullSangamTotal = sumhf.full_Sangamsum;

					console.log(halfSangamTotal, fullSangamTotal);

					for (index in allBidDataOC) {
						let bidDigit = allBidDataOC[index].bidDigit;
						let bidPoints = allBidDataOC[index].biddingPoints;
						let gamePrice = allBidDataOC[index].gameTypePrice;
						let amtToPay = bidPoints * gamePrice;
						let strLength = bidDigit.length;

						switch (strLength) {
							case 2:
								let digit1 = parseInt(bidDigit.charAt(0));
								let digit2 = parseInt(bidDigit.charAt(1));
								if (digit1 === resultSingleDigit) {
									let pointsNew = bidPoints * jodiPrice;
									singleDigitSum = singleDigitSum + pointsNew;
									singleDigitArray[digit2]["biddingPoints"] += pointsNew;
								}
								break;
							case 5:
								let digitSplithalf = bidDigit.split("-");
								let digitpana3 = parseInt(digitSplithalf[0]);
								let digitpana4 = digitSplithalf[1];
								if (
									digitpana3 === resultpanaDigit ||
									digitpana3 === resultSingleDigit
								) {
									let loss = amtToPay - halfSangamTotal;
									if (digitpana4.toString().length === 3) {
										let sum = rates(digitpana4, loss, sp, dp, tp);
										panaSum = panaSum + parseInt(sum);
										let addDigit = digitpana4.toString();
										panaArray[addDigit]["biddingPoints"] += parseInt(sum);
									} else {
										let sum = loss / jodiPrice;
										singleDigitSum = singleDigitSum + sum;
										singleDigitArray[digitpana4]["biddingPoints"] += sum;
									}
								}
								break;
							case 7:
								let digitSplit = bidDigit.split("-");
								let digitpana1 = parseInt(digitSplit[0]);
								let digitpana2 = digitSplit[1];
								if (digitpana1 === resultpanaDigit) {
									let loss = amtToPay - fullSangamTotal;
									let sum = rates(digitpana1, loss, sp, dp, tp);
									panaSum = panaSum + parseInt(sum);
									let addDigit = digitpana2.toString();
									panaArray[addDigit]["biddingPoints"] += parseInt(sum);
								}
								break;
						}
					}

					res.json({
						status: 1,
						message: "success",
						finalData: {
							singleDigitArray: singleDigitArray,
							panaArray: panaArray,
						},
						dataSum: {
							singleDigit: singleDigitSum.toFixed(0),
							Pana: panaSum.toFixed(0),
						},
						price: {
							sp: sp,
							dp: dp,
							tp: tp,
							jodiPrice: jodiPrice,
						},
					});
				})
				.catch(function (err) {
					res.status(400).json({
						status: 0,
						message: "Something Went Wrong Contact Support",
						error: err,
					});
				});
		} else {
			res.status(200).json({
				status: 0,
				message: "Open Result Not Declared",
			});
		}
	} catch (error) {
		res.status(200).json({
			status: 0,
			message: "Something Went Wrong Contact Support",
		});
	}
});

function rates(digit, loss, spp, dpp, tpp) {
	let spArray = [
		127,
		136,
		145,
		190,
		235,
		280,
		370,
		389,
		460,
		479,
		569,
		578,
		128,
		137,
		146,
		236,
		245,
		290,
		380,
		470,
		489,
		560,
		579,
		678,
		129,
		138,
		147,
		156,
		237,
		246,
		345,
		390,
		480,
		570,
		589,
		679,
		120,
		139,
		148,
		157,
		238,
		247,
		256,
		346,
		490,
		580,
		670,
		689,
		130,
		149,
		158,
		167,
		239,
		248,
		257,
		347,
		356,
		590,
		680,
		789,
		140,
		159,
		168,
		230,
		249,
		258,
		267,
		348,
		357,
		456,
		690,
		780,
		123,
		150,
		169,
		178,
		240,
		259,
		268,
		349,
		358,
		367,
		457,
		790,
		124,
		160,
		278,
		179,
		250,
		269,
		340,
		359,
		368,
		458,
		467,
		890,
		125,
		134,
		170,
		189,
		260,
		279,
		350,
		369,
		468,
		378,
		459,
		567,
		126,
		135,
		180,
		234,
		270,
		289,
		360,
		379,
		450,
		469,
		478,
		568,
	];

	let dpArray = [
		118,
		226,
		244,
		299,
		334,
		488,
		550,
		668,
		677,
		100,
		119,
		155,
		227,
		335,
		344,
		399,
		588,
		669,
		110,
		200,
		228,
		255,
		336,
		499,
		660,
		688,
		778,
		166,
		229,
		300,
		337,
		355,
		445,
		599,
		779,
		788,
		112,
		220,
		266,
		338,
		400,
		446,
		455,
		699,
		770,
		113,
		122,
		177,
		339,
		366,
		447,
		500,
		799,
		889,
		600,
		114,
		277,
		330,
		448,
		466,
		556,
		880,
		899,
		115,
		133,
		188,
		223,
		377,
		449,
		557,
		566,
		700,
		116,
		224,
		233,
		288,
		440,
		477,
		558,
		800,
		990,
		117,
		144,
		199,
		225,
		388,
		559,
		577,
		667,
		900,
	];

	let tpArray = ["000", 111, 222, 333, 444, 555, 666, 777, 888, 999];

	let sp = spArray.includes(digit);
	let dp = dpArray.includes(digit);
	// let tp = tpArray.includes(digit);
	let divideResult = "";

	if (sp) {
		divideResult = (loss / spp).toFixed(0);
	} else if (dp) {
		divideResult = (loss / dpp).toFixed(0);
	} else {
		divideResult = (loss / tpp).toFixed(0);
	}

	return divideResult;
}

async function commonQuery(providerId, date, session) {
	const allBidData = await gameBids.find(
		{ providerId: providerId, gameDate: date, gameSession: session },
		{ bidDigit: 1, biddingPoints: 1, gameTypePrice: 1, gameSession: 1 }
	);

	if (Object.keys(allBidData).length != 0) {
		let singleDigitSum = 0;
		let panaSum = 0;
		let panaArray = {};
		let singleDigitArray = {
			"0": { digit: "0", biddingPoints: 0 },
			"1": { digit: "1", biddingPoints: 0 },
			"2": { digit: "2", biddingPoints: 0 },
			"3": { digit: "3", biddingPoints: 0 },
			"4": { digit: "4", biddingPoints: 0 },
			"5": { digit: "5", biddingPoints: 0 },
			"6": { digit: "6", biddingPoints: 0 },
			"7": { digit: "7", biddingPoints: 0 },
			"8": { digit: "8", biddingPoints: 0 },
			"9": { digit: "9", biddingPoints: 0 },
		};

		const panaDigit = await digits.find();
		for (index in panaDigit) {
			let key = panaDigit[index].Digit.toString();
			panaArray[key] = {
				digit: key,
				digitFamily: panaDigit[index].DigitFamily,
				biddingPoints: 0,
			};
		}

		for (index in allBidData) {
			let bidDigit = allBidData[index].bidDigit;
			let length = bidDigit.length;
			let points = allBidData[index].biddingPoints;

			if (length == 1) {
				singleDigitSum = singleDigitSum + points;
			}
			if (length == 3) {
				panaSum = panaSum + points;
			}

			switch (length) {
				case 1:
					singleDigitArray[bidDigit]["biddingPoints"] += points;
					break;
				case 3:
					panaArray[bidDigit]["biddingPoints"] += points;
					break;
			}
		}

		let returnData = {
			status: 1,
			singleDigitArray: singleDigitArray,
			panaArray: panaArray,
			panaSum: panaSum,
			singleDigitSum: singleDigitSum,
		};
		return Promise.resolve(returnData);
	} else {
		let returnData = { status: 0 };
		return Promise.resolve(returnData);
	}
}

module.exports = router;

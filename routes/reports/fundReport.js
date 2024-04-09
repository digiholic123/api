const router = require("express").Router();
const bank = require("../../model/bank");
const userInfo = require("../../model/API/Users");
const fundReport = require("../../model/API/FundRequest");
const session = require("../helpersModule/session");
const adminName = require("../../model/dashBoard/AdminModel");
const bids = require("../../model/games/gameBids");
const UPI_list = require("../../model/upi_ids");
const upi_entries = require("../../model/API/upiPayments");
const trakpay = require("../../model/onlineTransaction");
const permission = require("../helpersModule/permission");
const moment = require("moment");

router.get("/", session, permission, async (req, res) => {
	try {
		const bankList = await bank.find();
		const adminList = await adminName.find({}, { username: 1 });
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["fundReport"].showStatus;
		if (check === 1) {
			res.render("./reports/fundReport", {
				data: bankList,
				userInfo: userInfo,
				permission: permissionArray,
				adminName: adminList,
				title: "Fund Report",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (e) {
		res.json({
			status: 0,
			message: "contact Support",
			data: e,
		});
	}
});

router.post("/", session, async (req, res) => {
	const sdate = req.body.sdate;
	const edate = req.body.edate;
	const bankName = req.body.bankName;
	const reqType = req.body.reqType;
	const admin_id = req.body.admin_id;
	const startDate0 = moment(sdate, "MM-DD-YYYY").format("DD/MM/YYYY");
	const endDate0 = moment(edate, "MM-DD-YYYY").format("DD/MM/YYYY");

	var startDate = moment(startDate0, "DD/MM/YYYY").unix();
	var endDate = moment(endDate0, "DD/MM/YYYY").unix();

	try {
		let query = {
			reqType: reqType,
			timestamp: {
				$gte: startDate,
				$lte: endDate,
			},
			withdrawalMode: bankName,
			admin_id: admin_id,
		};

		if (admin_id == 1) {
			query = {
				reqType: reqType,
				timestamp: {
					$gte: startDate,
					$lte: endDate,
				},
				withdrawalMode: bankName,
			};
		}

		if (bankName == 1) {
			query = {
				reqType: reqType,
				timestamp: {
					$gte: startDate,
					$lte: endDate,
				},
				UpdatedBy: { $regex: admin_id },
			};
		}

		if (bankName == 1 && admin_id == 1) {
			query = {
				reqType: reqType,
				timestamp: {
					$gte: startDate,
					$lte: endDate,
				},
			};
		}

		const Report = await fundReport
			.find(query, {
				username: 1,
				mobile: 1,
				reqUpdatedAt: 1,
				withdrawalMode: 1,
				reqAmount: 1,
				UpdatedBy: 1,
			})
			.sort({ _id: -1 });

		if (Report) {
			res.json({
				status: 1,
				data: Report,
			});
		} else {
			res.json({
				status: 1,
				message: "No Data Found",
				data: Report,
			});
		}
	} catch (error) {
		console.log(error);
		res.json({
			status: 0,
			message: "contact Support",
			data: error,
		});
	}
});

router.get("/dailyReport", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["dailyReport"].showStatus;
		if (check === 1) {
			res.render("./reports/dailyReport", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Daily Report",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (e) {
		res.json(e);
	}
});

router.post("/dailyData", session, async (req, res) => {
	const type = req.body.reqType;
	const sdate = req.body.sdate;
	const edate = req.body.edate;
	const username = req.body.username;
	try {
		if (type === "PG") {
			//PG = PLAY GAME
			let query = {
				gameDate: {
					$gte: sdate,
					$lte: edate,
				},
			};
			if (username != "") {
				query = {
					gameDate: {
						$gte: sdate,
						$lte: edate,
					},
					userName: username,
				};
			}
			const gamebids = await bids.find(query);
			res.json(gamebids);
		} else if (type === "UR") {
			//UR = USER RESGISTRATION
			const userData = await userInfo.find({
				CtreatedAt: {
					$gte: sdate,
					$lte: edate,
				},
			});
			res.json(userData);
		} else if (type === "RDP") {
			//RDP = Request For Deposite Point
			const FundData = await fundReport.find({
				reqDate: {
					$gte: sdate,
					$lte: edate,
				},
				reqType: "Credit",
			});
			res.json(FundData);
		} else if (type === "RWP") {
			// RWP = Request For Withdraw Point
			const FundData = await fundReport.find({
				reqDate: {
					$gte: sdate,
					$lte: edate,
				},
				reqType: "Debit",
			});
			res.json(FundData);
		} else if (type === "CRDP") {
			// CRDP = Cancel Request For Deposite Point
			const FundData = await fundReport.find({
				reqDate: {
					$gte: sdate,
					$lte: edate,
				},
				reqType: "Credit",
				reqStatus: "Declined",
			});
			res.json(FundData);
		} //CRWP = Cancel Request For Withdraw Point
		else {
			const FundData = await fundReport.find({
				reqDate: {
					$gte: sdate,
					$lte: edate,
				},
				reqType: "Debit",
				reqStatus: "Declined",
			});
			res.json(FundData);
		}
	} catch (error) {
		res.json(error);
	}
});

router.get("/upiReport", session, permission, async (req, res) => {
	try {
		const upiList = await UPI_list.find();
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["fundReport"].showStatus;
		if (check === 1) {
			res.render("./reports/upi_list", {
				userInfo: userInfo,
				permission: permissionArray,
				upiList: upiList,
				title: "UPI Report",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (error) {
		console.log(error);
		res.json(error);
	}
});

router.get("/trakpay", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["fundReport"].showStatus;
		if (check === 1) {
			res.render("./reports/trakpay", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "UPI Report",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (error) {
		console.log(error);
		res.json(error);
	}
});

router.get("/razorpay", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["fundReport"].showStatus;
		if (check === 1) {
			res.render("./reports/razorpay", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "UPI Report",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (error) {
		console.log(error);
		res.json(error);
	}
});

router.post("/getUPIReport", session, async (req, res) => {
	try {
		const id = req.body.id;
		const date = req.body.date;
		const dateStart = req.body.dateStart;
		const startDate0 = moment(dateStart, "MM-DD-YYYY").format("DD/MM/YYYY");
		const endDate0 = moment(date, "MM-DD-YYYY").format("DD/MM/YYYY");
		var startDate = moment(startDate0, "DD/MM/YYYY").unix();
		var endDate = moment(endDate0, "DD/MM/YYYY").unix();

		let query;
		if (id == "1") {
			query = {
				timestamp: {
					$gte: startDate,
					$lte: endDate,
				},
				reqStatus: "Approved",
			};
		} else {
			query = {
				timestamp: {
					$gte: startDate,
					$lte: endDate,
				},
				reqStatus: "Approved",
				upi_name_id: id,
			};
		}

		const reportData = await upi_entries.find(query).sort({ _id: -1 });

		res.json({
			status: 1,
			message: "Success",
			data: reportData,
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 0,
			message: "Something Bad Happend Contact Support",
		});
	}
});

router.post("/trakReport", session, async (req, res) => {
	try {
		const date = req.body.edate;
		const dateStart = req.body.sdate;
		const startDate0 = moment(dateStart, "MM-DD-YYYY").format("DD/MM/YYYY");
		const endDate0 = moment(date, "MM-DD-YYYY").format("DD/MM/YYYY");
		var startDate = moment(startDate0, "DD/MM/YYYY").unix();
		var endDate = moment(endDate0, "DD/MM/YYYY").unix();

		query = {
			timestamp: {
				$gte: startDate,
				$lte: endDate,
			},
			reqStatus: 0,
		};

		const reportData = await trakpay.find(query).sort({ _id: -1 });

		res.json({
			status: 1,
			message: "Success",
			data: reportData,
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 0,
			message: "Something Bad Happend Contact Support",
		});
	}
});

router.post("/razorpayReport", session, async (req, res) => {
	try {
		const date = req.body.edate;
		const dateStart = req.body.sdate;
		const startDate0 = moment(dateStart, "MM-DD-YYYY").format("DD/MM/YYYY");
		const endDate0 = moment(date, "MM-DD-YYYY").format("DD/MM/YYYY");
		var startDate = moment(startDate0, "DD/MM/YYYY").unix();
		var endDate = moment(endDate0, "DD/MM/YYYY").unix();

		query = {
			timestamp: {
				$gte: startDate,
				$lte: endDate,
			},
			reqStatus: 0,
			mode:'razorpay'

		};

		const reportData = await trakpay.find(query).sort({ _id: -1 });

		res.json({
			status: 1,
			message: "Success",
			data: reportData,
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 0,
			message: "Something Bad Happend Contact Support",
		});
	}
});

router.post("/getBriefDeposit", session, async (req, res) => {
	try {
		const startDate0 = moment().format("DD/MM/YYYY");
		const startDate = moment(startDate0, "DD/MM/YYYY").unix();
		console.log("TIME",startDate )
		const gatewayAmount = await trakpay.aggregate([
			{
				$match: { timestamp: startDate },
			},
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$reqAmount" },
					upiName: { $first: "$reqType" },
				},
			},
		]);

		const upiAmount = await upi_entries.aggregate([
			{
				$match: { timestamp: startDate, reqStatus: "Approved" },
			},
			{
				$group: {
					_id: "$upi_name_id",
					totalAmount: { $sum: "$reqAmount" },
					upiName: { $first: "$upi_name" },
				},
			},
		]);

		const bindData = [...gatewayAmount, ...upiAmount];
		res.json(bindData);
	} catch (error) {
		res.json({
			status: 0,
			message: "Server Error",
		});
	}
});

module.exports = router;

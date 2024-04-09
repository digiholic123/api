const router = require("express").Router();
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const requestON = require("../../model/Withdraw_Req_On_Off");
const dateTime = require("node-datetime");
const dt = dateTime.create();

router.get("/", session, permission, async (req, res) => {
	try {
		const reqdata = await requestON.find().sort({ _id: 1 });
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["reqONOFF"].showStatus;
		if (check === 1) {
			res.render("./wallet/reqOnOff", {
				reqdata: reqdata,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Req ON/OFF",
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

router.post("/updateReq", async (req, res) => {
	try {
		const id = req.body.rowId;
		const status = req.body.status;
		const message = req.body.reason;
		const date = dt.format("m/d/Y I:M:S");

		const update = await requestON.updateOne(
			{ _id: id },
			{ $set: { message: message, enabled: status, updatedAt: date } }
		);

		res.json(update);
	} catch (error) {
		res.json(error);
	}
});

module.exports = router;

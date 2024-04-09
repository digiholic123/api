const router = require("express").Router();
const User = require("../../model/API/Users");
const kgdg = require("../../model/kgdbuser");
const deletedUser = require("../../model/API/Deleted_User");
const profile = require("../../model/API/Profile");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const dateTime = require("node-datetime");

router.get("/", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;

		const check = permissionArray["users"].showStatus;
		if (check === 1) {
			res.render("dashboard/user", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "All Users",
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

router.get("/KGDG", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;

		const check = permissionArray["users"].showStatus;
		if (check === 1) {
			res.render("dashboard/kgdguser", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "All Users",
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

router.get("/deletedUser", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["users"].showStatus;
		if (check === 1) {
			res.render("dashboard/deletedUsers", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Deleted Users",
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

router.post("/getProfile", session, async (req, res) => {
	try {
		const id = req.body.id;
		const userProfile = await profile.findOne({ userId: id });
		res.json({
			status: 1,
			message: "User Profile",
			userData: userProfile,
		});
	} catch (err) {
		res.json(err);
	}
});

router.post("/blockUser", session, async (req, res) => {
	try {
		const id = req.body.id;
		const blockStatus = req.body.blockStatus;
		const rsn = req.body.blockReason;
		await User.updateOne(
			{ _id: id },
			{ $set: { banned: blockStatus, blockReason: rsn } }
		);
		res.json({
			status: 1,
			message: "Blocked Successfully",
		});
	} catch (err) {
		res.json(err);
	}
});

router.post("/userAjax", function (req, res) {
	try {
		let i = parseInt(req.body.start) + 1;
		User.dataTables({
			limit: req.body.length,
			skip: req.body.start,
			order: req.body.order,
			columns: req.body.columns,
			search: {
				value: req.body.search.value,
				fields: ["username", "name", "mobile"],
			},
			sort: { username: 1, name: 1, mobile: 1, sno: 1, CreatedAt: 1, block: 1 },
		})
			.then(function (table) {
				let dataTab = table.data;
				let tabelArray = [];
				for (index in dataTab) {
					let id = "'" + dataTab[index]._id + "'";
					let mobileNumber = dataTab[index].mobile;
					let block = dataTab[index].banned;
					let btnBlock = "";
					if (block === false) {
						btnBlock =
							'<button class="btn btn-bordred-danger waves-effect width-xs waves-light btn-xs"  data-toggle="modal" data-target=".bs-example-modal-sm" onclick="reasonPop(' +
							id +
							', true)">Block</button>';
					} else {
						btnBlock =
							'<button class="btn btn-bordred-purple waves-effect width-xs waves-light btn-xs"  onclick="blockUserNew(' +
							id +
							', false)" title="' +
							dataTab[index].blockReason +
							'">Un-Block</button>';
					}

					let dataJson = {
						sno: i,
						name: dataTab[index].name,
						username: dataTab[index].username,
						mobile: mobileNumber,
						deviceName: dataTab[index].deviceName,
						deviceId: dataTab[index].deviceId,
						CreatedAt: dataTab[index].CreatedAt,
						profile:
							'<button class="btn btn-bordred-purple waves-effect width-xs waves-light btn-xs" data-toggle="modal" data-target="#myModal" onclick="profile(' +
							id +
							')">Profile</button>',
						block: btnBlock,
						delete:'<span><button type="button"data-toggle="modal" data-target=".deleteModalConfirm"  onclick="reasonPop(' +id +', true)" class="btn btn-bordred-danger waves-effect width-xs waves-light btn-xs">Delete</button></span>'
					};
					tabelArray.push(dataJson);
					i++;
				}
				res.json({
					data: tabelArray,
					recordsFiltered: table.total,
					recordsTotal: table.total,
				});
			})
			.catch(function (error) {
				res.json({
					status: 0,
					message: "Request To Large",
				});
			});
	} catch (error) {
		res.json(error);
	}
});

router.post("/userAjaxKSDG", function (req, res) {
	try {
		let i = parseInt(req.body.start) + 1;
		kgdg
			.dataTables({
				limit: req.body.length,
				skip: req.body.start,
				order: req.body.order,
				columns: req.body.columns,
				search: {
					value: req.body.search.value,
					fields: ["username", "mobile"],
				},
				sort: { username: 1, mobile: 1 },
			})
			.then(function (table) {
				let dataTab = table.data;
				let tabelArray = [];
				for (index in dataTab) {
					let dataJson = {
						sno: i,
						username: dataTab[index].username,
						mobile: dataTab[index].mobile,
						wallet_balance: dataTab[index].wallet_balance,
					};
					tabelArray.push(dataJson);
					i++;
				}
				res.json({
					data: tabelArray,
					recordsFiltered: table.total,
					recordsTotal: table.total,
				});
			})
			.catch(function (error) {
				res.json({
					status: 0,
					message: "Request To Large",
				});
			});
	} catch (error) {
		res.json(error);
	}
});

router.post("/deleteduserAjax", function (req, res) {
	try {
		let i = parseInt(req.body.start) + 1;
		deletedUser
			.dataTables({
				limit: req.body.length,
				skip: req.body.start,
				order: req.body.order,
				columns: req.body.columns,
				search: {
					value: req.body.search.value,
					fields: ["username", "name", "mobile"],
				},
				sort: {
					username: 1,
					name: 1,
					mobile: 1,
					sno: 1,
				},
			})
			.then(function (table) {
				let dataTab = table.data;
				let tabelArray = [];
				for (index in dataTab) {
					let mobileNumber = dataTab[index].mobile;
					let dataJson = {
						sno: i,
						name: dataTab[index].name,
						username: dataTab[index].username,
						email: dataTab[index].email,
						mobile: mobileNumber,
						deviceName: dataTab[index].deviceName,
						deviceId: dataTab[index].deviceId,
						deleteRsn: dataTab[index].deleteRsn,
					};
					tabelArray.push(dataJson);
					i++;
				}
				res.json({
					data: tabelArray,
					recordsFiltered: table.total,
					recordsTotal: table.total,
				});
			})
			.catch(function (error) {
				res.json({
					status: 0,
					message: "Request To Large",
				});
			});
	} catch (error) {
		res.json(error);
	}
});

router.post('/deleteUserByAdmin' , session , async (req , res)=>{
	try{

		const userData = await User.findOne({_id : req.body.id})

		if(!userData){
			res.json({status:false, message:'User not found!'})
		}
		const dt = dateTime.create();
		const formatted = dt.format("d/m/Y I:M:S");
		
		const user = {
			userId: userData._id,
			name: userData.name,
			email: userData.email,
			password: userData.password,
			username:userData.username,
			mobile:userData.mobile,
			firebaseId: userData.firebaseId,
			deviceName: userData.deviceName,
			deviceId: userData.deviceId,
			deviceVeriOTP:userData.deviceVeriOTP,
			register_via: userData.register_via,
			wallet_bal_updated_at: userData.wallet_bal_updated_at,
			wallet_balance: userData.wallet_balance,
			role: 1,
			mpin: userData.mpin,
			mpinOtp: userData.mpinOtp,
			Deleted_At: formatted,
			CreatedAt:userData.CreatedAt,
			deleteRsn: req.body.reason,
			mainNotification:userData.mainNotification,
			gameNotification: userData.gameNotification,
			starLineNotification: userData.starLineNotification,
			andarBaharNotification:userData.andarBaharNotification,
		};
		await deletedUser.insertMany([user]);
		await User.deleteOne({_id : req.body.id});
		res.json({status:false, message:"Deleted successfully"})
	}catch(err){
		res.json({status:false, message:err.message})
	}
	
});


module.exports = router;

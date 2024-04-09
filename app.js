const express = require("express");
const app = express();
const engine = require("ejs-locals");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const methodOverride = require("method-override");
const responseTime = require("response-time");
const cron = require("node-cron");
const dateTime = require("node-datetime");
const expressip = require("express-ip");
const redis = require("redis");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const morgan = require('morgan')
const whatsAppCron = require('./routes/whatsapp/whatsapp')


// var MemoryStore = require('memorystore')(session)

//API ROUTES
const authRoute = require("./routes/API/auth");
const profileUpdate = require("./routes/API/profile/userProfile");
const mpin = require("./routes/API/mpin");
const funds = require("./routes/API/funds/fundRequest");
const htp = require("./routes/API/appSetting/htp");
const resulthistory = require("./routes/API/history/resultHistroy");
const bidsHistory = require("./routes/API/history/bidsHistory");
const Bids = require("./routes/API/bids/bids");
const newsNotification = require("./routes/API/common");
const result = require("./routes/API/gameResult/allResult");
const gameTypes = require("./routes/API/gameType/gameType");
const register = require("./routes/API/admin");
const recovery = require("./routes/API/recovery");

//INTERNAL ROUTES
const index = require("./routes/dashboard/index");
const user = require("./routes/dashboard/users");
const games = require("./routes/games/allGames");
const gameSetting = require("./routes/games/gameSetting");
const gameRates = require("./routes/games/gameList");
const gameResult = require("./routes/games/gameResult");
const winnerList = require("./routes/games/winnersList");
const starlineProvider = require("./routes/starline/starlineProvider");
const starlineSettings = require("./routes/starline/starGameSetting");
const starlineGameList = require("./routes/starline/starGameList");
const starlineResult = require("./routes/starline/starGameResult");
const starProfitLoss = require("./routes/starline/starLinePF");
const andarBaharProvider = require("./routes/andarBahar/andarBaharProvider");
const andarBaharSettings = require("./routes/andarBahar/gameSetting");
const andarbahargamerates = require("./routes/andarBahar/gameList");
const andarbaharresult = require("./routes/andarBahar/gameResult");
const ABProfitLoss = require("./routes/andarBahar/andarBaharPF");
const fundData = require("./routes/wallet/fundReq");
const wallet = require("./routes/wallet/view_wallet");
const reqONOFF = require("./routes/wallet/reqON-OFF");
const debitReport = require("./routes/wallet/exportDebit");
const approvedReports = require("./routes/dashboard/approvedReports");
const cuttingGroup = require("./routes/dashboard/cuttingGroup");
const salesReport = require("./routes/reports/salesReport");
const totalBids = require("./routes/reports/totalBid");
const fundReport = require("./routes/reports/fundReport");
const creditDebit = require("./routes/reports/credit_debit");
const analysys = require("./routes/reports/marketRatioAnalysys");
const howPlay = require("./routes/appSetting/appSettings");
const master = require("./routes/master/bank");
const jodiAll = require("./routes/dashboard/jodiAll");
const common = require("./routes/dashboard/common");
const addWinpoints = require("./routes/games/addWinponitsAll");
const finaOC = require("./routes/dashboard/finalOCcutting");
const employee = require("./routes/master/employee");
const settelment = require("./routes/dashboard/finalCuttingHisab"); 
const temp = require("./routes/dashboard/login");
const payments = require('./routes/API/payments/razorPay')

//Connect To DB
dotenv.config();
mongoose.connect(
	process.env.DB_CONNECT,
	{
		useNewUrlParser: true,
		useFindAndModify: false,
		useCreateIndex: true,
		useUnifiedTopology: true,
	},
	(err) => {
		if (err) console.log(err);
		else console.log("Mongo Connected");
	}
)



// Configure session middleware
app.use(session({
	store: MongoStore.create({ mongoUrl: process.env.DB_CONNECT }),
	secret: 'dashboard###$$$$123321',
	resave: false,
	saveUninitialized: true,
  }));
  

// Logger
app.use(morgan('dev'));

//Public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

const corsOpts = {
	origin: '*',
	methods: [
	  'GET',
	  'POST',
	],
	allowedHeaders: [
	  "Access-Control-Allow-Headers",
	  "x-access-token, Origin, Content-Type, Accept", "authorization",
	],
  };
  app.use(cors(corsOpts));

app.use(function (req, res, next) {
	res.set(
		"Cache-Control",
		"no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
	);
	next();
});

//body parser
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(cors());
app.use(responseTime());

// view engine setup
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// app.use(
// 	session({
// 		store: new RedisStore({ host: '162.241.115.39', port: 6379, client: redisClient }),
// 		secret: "keyboard cat",
// 		resave: false,
// 		saveUninitialized: true,
// 	})
// );

// redisClient.on("error", (err) => {
// 	console.log(err);
// });

//Routing API middleware
app.use("/66.70.160.240", temp);
app.use("/", index);
app.use("/dashboard", index);
app.use("/api/user", authRoute);
app.use("/profile", profileUpdate);
app.use("/MPIN", mpin);
app.use("/fundreq", funds);
app.use("/history", resulthistory);
app.use("/bidsHistory", bidsHistory);
app.use("/Bids", Bids);
app.use("/nnData", newsNotification);
app.use("/result", result);
app.use("/gameTypes", gameTypes);
app.use("/register", register);
app.use("/recovery", recovery);

//Routing Dashboard middleware
app.use("/userList", user);
app.use("/games", games);
app.use("/masters", master);
app.use("/gamesSetting", gameSetting);
app.use("/gameList", gameRates);
app.use("/gameResult", gameResult);
app.use("/winner", winnerList);
app.use("/starlineProvider", starlineProvider);
app.use("/starlinegamesetting", starlineSettings);
app.use("/starlinegamerates", starlineGameList);
app.use("/starProfitLoss", starProfitLoss);
app.use("/starlinegameresult", starlineResult);
app.use("/providerAB", andarBaharProvider);
app.use("/andarbahargamesetting", andarBaharSettings);
app.use("/andarbahargamerates", andarbahargamerates);
app.use("/andarbahargameresult", andarbaharresult);
app.use("/ABProfitLoss", ABProfitLoss);
app.use("/fundRequest", fundData);
app.use("/customerBalance", wallet);
app.use("/reqOnOff", reqONOFF);
app.use("/debitReport", debitReport);
app.use("/cuttinggroup", cuttingGroup);
app.use("/approvedReports", approvedReports);
app.use("/salesReport", salesReport);
app.use("/totalBids", totalBids);
app.use("/fundReport", fundReport);
app.use("/creditDebit", creditDebit);
app.use("/analysys", analysys);
app.use("/appSettings", howPlay);
app.use("/htp", htp);
app.use("/common", common);
app.use("/jodiAll", jodiAll);
app.use("/addWinpoints", addWinpoints);
app.use("/finalOCcuttinggroup", finaOC);
app.use("/employee", employee);
app.use("/settelment", settelment);
app.use("/payments", payments)

const gameProvi = require("./model/games/Games_Provider");
const declineNoti = require("./routes/helpersModule/cancelReq");
const fund = require("./model/API/FundRequest");
const userBal = require("./model/API/Users");
const userWalletTracing = require("./model/Wallet_Bal_trace");
const userDltCron = require("./routes/helpersModule/cronJobs");

userDltCron();
cron.schedule("0 9 * * *", async () => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("m/d/Y I:M:S p");

		await gameProvi.updateMany({
			$set: {
				providerResult: "***-**-***",
				modifiedAt: formatted,
				resultStatus: 0,
			},
		});
	} catch (error) {
		console.log(error);
	}
});

cron.schedule("55 23 * * *", async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("d/m/Y");
		await fund.updateMany(
			{ reqStatus: "Pending" },
			{
				$set: { reqStatus: "Declined", reqUpdatedAt: formatted },
			}
		);
		declineNoti();
	} catch (error) {
		console.log(error);
	}
});

cron.schedule("5 0 * * *", async (req, res) => {
	try {
		const Active_TotWalletBal = await userBal.aggregate([
			{ $match: { banned: false } },
			{ $group: { _id: null, sumdigit: { $sum: "$wallet_balance" } } },
		]);
		if (Active_TotWalletBal.length) {
			const dt = dateTime.create();
			const formatted = dt.format("d/m/Y I:M:S p");
			const trace = new userWalletTracing({
				walletBal_12oClock: Active_TotWalletBal[0].sumdigit,
				createdAt: formatted,
			});
			await trace.save();
		}
	} catch (error) {
		console.log(error);
	}
});

cron.schedule("*/1 * * * *", async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("I:M p");
                var time = new Date();
                const current_time= time.toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true })

		whatsAppCron.executeWhatsAppTrigger(`${current_time}`)
	    console.log("WhatsApp Cron...",current_time)
	} catch (error) {
		console.log(error);
	}
});

const port = process.env.port || 5001;


app.listen(port, () => {
	new Date().toLocaleDateString()
	console.log(`Running on PORT: ${port} Date: ${new Date().toLocaleString()}`);
});

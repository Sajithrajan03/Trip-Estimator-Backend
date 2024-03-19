const express =  require("express")
const router = express.Router()
const webController = require("../controller/webController")
const webController2 = require("../controller/webController_2")
const authController = require("../controller/AuthController")
router.post("/login",authController.userlogin)
router.post("/validateLogin",authController.uservalidation)

router.post("/registerUserData",webController2.registerUserData)

router.get('/test', webController.test);
router.post('/registerHotelData', webController.registerHotelData);
router.get('/getHotelData', webController.getHotelData);
router.post('/registerFlightData', webController.registerFlightData);
router.get('/getFlightData', webController.getFlightData);
router.post('/registerCityData', webController.registerCityData);
router.post('/registerRouteData', webController.registerRouteData);
router.post('/registerBusData', webController.registerBusData);
router.get('/getCityData', webController.getCityData);
router.get('/getRouteData', webController.getRouteData);
router.get('/getBusData', webController.getBusData);
router.post('/registerTrainData', webController.registerTrainData);
router.post('/registerCarData', webController.registerCarData);
router.get('/getTrainData', webController.getTrainData);
router.get('/getCarData', webController.getCarData);

module.exports = router
const express =  require("express")
const router = express.Router()
const webController = require("../controller/webController")

router.get('/test',webController.test)
router.post('/registerData',webController.registerData)
router.get('/getRegisterData',webController.getRegisterData)
router.post('/registerHotel',webController.registerHotel)
module.exports = router
const express =  require("express")
const router = express.Router()
const webController = require("../controller/webController")

router.get('/test',webController.test)
router.get('/registerData',webController.registerData)

module.exports = router
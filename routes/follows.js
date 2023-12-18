// ****************************JAVASCRIPT LIBRARIES******************************



// *****************************EXTERNAL LIBRARIES*******************************

const express = require("express");
const router = express.Router();
const userController = require("../controllers/follows");

// ******************************OWN LIBRARIES***********************************

const auth = require("../middlewares/auth");

// ******************************************************************************

// Definir rutas
router.post("/save", auth, userController.save);

router.delete("/unfollow/:id", auth, userController.unfollow);

router.get("/following/:id?/:page?", auth, userController.following);

router.get("/followed/:id?/:page?", auth, userController.followers);

module.exports = router;
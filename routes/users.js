// ****************************JAVASCRIPT LIBRARIES******************************



// *****************************EXTERNAL LIBRARIES*******************************
const userController = require("../controllers/users");
const uploads = require("../services/multer");
const auth = require("../middlewares/auth");
const express = require("express");
const router = express.Router();
// ******************************OWN LIBRARIES***********************************


// ******************************************************************************

router.post("/register", userController.register);

router.post("/login", userController.login);

router.get("/profile/:id", auth, userController.profile);

router.get("/list/:page?", auth, userController.list);

router.put("/update", auth, userController.update);

router.post("/upload", [auth, uploads.single("file0")], userController.upload);

router.get("/avatar/:file", auth, userController.avatar);

router.get("/counter/:id?", auth, userController.counters);

// Exportar router
module.exports = router;
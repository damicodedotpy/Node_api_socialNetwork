// ****************************JAVASCRIPT LIBRARIES******************************



// *****************************EXTERNAL LIBRARIES*******************************

const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publications");
const auth = require("../middlewares/auth");
const multer = require("multer");

// ******************************OWN LIBRARIES***********************************



// ******************************************************************************
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications");
    },
    filename: (req, file, cb) => {
        cb(null, "pub-" + Date.now() + "-" + file.originalname);
    }
})

const uploads = multer({storage})


// Definir rutas
router.post("/save", auth, publicationController.save);

router.get("/detail/:id", auth, publicationController.detail);

router.delete("/remove/:id", auth, publicationController.remove);

router.get("/user/:id", auth, publicationController.user);

router.post("/upload/:id", [auth, uploads.single("file0")], publicationController.upload);

router.get("/media/:file", auth, publicationController.media);

router.get("/feed/:page?", auth, publicationController.feed);


module.exports = router;
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const booksCtrl = require("../controllers/books");

router.post("/", auth, multer, booksCtrl.createBook);
router.put("/:id", auth, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);
router.get("/", booksCtrl.getAllBooks);
router.get("/:id", booksCtrl.getOneBook);

module.exports = router;

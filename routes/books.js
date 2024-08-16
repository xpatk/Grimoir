const express = require("express");
const router = express.Router();

const booksCtrl = require("../controllers/books");

router.post("/", booksCtrl.createBook);

router.put("/:id", booksCtrl.modifyBook);

router.delete("/:id", booksCtrl.deleteBook);

router.get("/", booksCtrl.getAllBooks);

router.get("/:id", booksCtrl.getOneBook);

module.exports = router;

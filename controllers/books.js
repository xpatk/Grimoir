const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");
const Book = require("../models/Book");

exports.createBook = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }

    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const webpImageBuffer = await sharp(req.file.buffer).webp().toBuffer();
    const filename = `${Date.now()}.webp`;
    const webpImagePath = path.join(__dirname, "../images", filename);

    await fs.writeFile(webpImagePath, webpImageBuffer);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${filename}`,
    });

    await book.save();
    res.status(201).json({ message: "Book enregistree" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.modifyBook = async (req, res, next) => {
  try {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };

    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: "Non authorise" });
    }

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );
    res.status(200).json({ message: "Book modifié!" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: "Book non trouve" });
    }

    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: "Non authorise" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    const imagePath = path.join(__dirname, "../images", filename);

    try {
      await fs.access(imagePath);
      await fs.unlink(imagePath);
    } catch (err) {
      console.warn(`Image file ${filename} not found, skipping deletion.`);
    }

    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Book supprimé !" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ error });
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.rateBook = async (req, res, next) => {
  try {
    const { userId, rating } = req.body;
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: "Book pas trouve" });
    }
    const rated = book.ratings.find((rating) => rating.userId === userId);
    if (rated) {
      return res
        .status(400)
        .json({ message: "Utilisateur a deja note ce book" });
    }
    book.ratings.push({ userId, grade: rating });

    let totalRating = 0;
    for (let rate of book.ratings) {
      totalRating += rate.grade;
    }

    book.averageRating = totalRating / book.ratings.length;

    await book.save();

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getBestBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};

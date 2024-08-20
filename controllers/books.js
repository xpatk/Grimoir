const Book = require("../models/Book");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const originalFilename = req.file.originalname
      .split(" ")
      .join("_")
      .split(".")[0];
    const optimizedPath = path.join("images", `${originalFilename}.webp`);

    sharp(req.file.buffer)
      .toFormat("webp")
      .toFile(optimizedPath)
      .then(() => {
        const book = new Book({
          ...bookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get(
            "host"
          )}/images/${originalFilename}.webp`,
        });

        book
          .save()
          .then(() => res.status(201).json({ message: "Book enregistré !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.modifyBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let bookObject = JSON.parse(req.body.book);
      bookObject._id = req.params.id;

      if (req.file) {
        const originalFilename = req.file.originalname
          .split(" ")
          .join("_")
          .split(".")[0];
        const optimizedPath = path.join("images", `${originalFilename}.webp`);

        sharp(req.file.buffer)
          .toFormat("webp")
          .toFile(optimizedPath)
          .then(() => {
            const oldFilename = book.imageUrl.split("/images/")[1];
            const oldImagePath = path.join("images", oldFilename);

            fs.access(oldImagePath, fs.constants.F_OK, (err) => {
              if (!err) {
                fs.unlink(oldImagePath, () => {
                  bookObject.imageUrl = `${req.protocol}://${req.get(
                    "host"
                  )}/images/${originalFilename}.webp`;

                  Book.updateOne({ _id: req.params.id }, bookObject)
                    .then(() =>
                      res.status(200).json({ message: "Book modifie!" })
                    )
                    .catch((updateError) => res.status(400).json({ error }));
                });
              } else {
                bookObject.imageUrl = `${req.protocol}://${req.get(
                  "host"
                )}/images/${originalFilename}.webp`;

                Book.updateOne({ _id: req.params.id }, bookObject)
                  .then(() =>
                    res.status(200).json({ message: "Book modifie!" })
                  )
                  .catch((updateError) => res.status(400).json({ error }));
              }
            });
          })
          .catch(() => res.status(500).json({ error }));
      } else {
        bookObject.imageUrl = book.imageUrl;

        Book.updateOne({ _id: req.params.id }, bookObject)
          .then(() => res.status(200).json({ message: "Book modifie!" }))
          .catch((updateError) => res.status(400).json({ error }));
      }
    })
    .catch(() => res.status(500).json({ error: "Book pas trouve" }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const filename = book.imageUrl.split("/images/")[1];
      const imagePath = path.join("images", filename);

      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(imagePath, (unlinkError) => {
            if (unlinkError) {
              return res.status(500).json({ error: "Failed to delete image" });
            }

            Book.deleteOne({ _id: req.params.id })
              .then(() =>
                res.status(200).json({ message: "Book deleted successfully!" })
              )
              .catch((deleteError) => res.status(400).json({ error }));
          });
        } else {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Book supprime" }))
            .catch((error) => res.status(400).json({ error }));
        }
      });
    })
    .catch(() => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

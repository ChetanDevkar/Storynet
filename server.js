const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // To access uploaded files

// ---------- MYSQL CONNECTION ----------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Chetan",   // your MySQL password
  database: "storynet"  // your database name
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Error:", err);
    return;
  }
  console.log("MySQL Connected!");
});

// ---------- MULTER (FILE UPLOAD) ----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder to store files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ---------- ROUTE: SUBMIT STORY ----------
app.post("/api/submit", upload.single("upload"), (req, res) => {
  try {
    const { name, email, hero, story } = req.body;
    const fileName = req.file ? req.file.filename : null;

    if (!name || !hero) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const sql = `INSERT INTO submissions (name, email, hero, story, file)
                 VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [name, email, hero, story, fileName], (err, result) => {
      if (err) {
        console.log("SQL Error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      return res.json({
        success: true,
        message: "Story submitted successfully!"
      });
    });

  } catch (error) {
    console.log("Server Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

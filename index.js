const express = require("express");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 8080;

// ================== Database ==================
const db = new sqlite3.Database("./ipo.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS ipos (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, openDate TEXT, closeDate TEXT, price TEXT, registrar TEXT)"
  );
  db.run("DELETE FROM ipos"); // clear old data each time app restarts
});

// ================== Fetch IPOs from Chittorgarh ==================
async function fetchChittorgarh() {
  try {
    const res = await axios.get("https://www.chittorgarh.com/newportal/ipo/ipo.json", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    });

    const ipos = res.data || [];
    console.log("Fetched IPOs:", ipos.length);

    // Clear existing IPOs
    db.run("DELETE FROM ipos");

    db.serialize(() => {
      ipos.forEach((ipo) => {
        db.run(
          "INSERT INTO ipos (name, openDate, closeDate, price, registrar) VALUES (?,?,?,?,?)",
          [ipo.IssueName, ipo.OpenDate, ipo.CloseDate, ipo.PriceBand, ipo.Registrar],
          (err) => {
            if (err) console.log("DB insert error:", err.message);
          }
        );
      });
    });
  } catch (e) {
    console.error("Error fetching Chittorgarh:", e.message);
  }
}

// ================== API Endpoint ==================
app.get("/ipos", (req, res) => {
  db.all("SELECT * FROM ipos", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ================== Test Endpoint ==================
app.get("/", (req, res) => {
  res.send("IPO API is running. Visit /ipos to see data.");
});

// ================== Start Server ==================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  fetchChittorgarh(); // run immediately
  setInterval(fetchChittorgarh, 1000 * 60 * 60); // run every 1 hour
});

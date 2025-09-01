// Basic IPO App Backend
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const sqlite3 = require("sqlite3").verbose();
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 8080;

// DB Setup
const db = new sqlite3.Database("./ipo.db");
db.run("CREATE TABLE IF NOT EXISTS ipos (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, openDate TEXT, closeDate TEXT, price TEXT, registrar TEXT)");

// Get Live IPOs from NSE (sample scraping)
async function fetchNSE() {
  try {
    const res = await axios.get("https://www.nseindia.com/api/ipo-current-issue", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.nseindia.com/"
      }
    });

    const ipos = res.data || [];
    if (ipos.length === 0) {
      console.log("No IPO data available");
      return;
    }

    db.serialize(() => {
      ipos.forEach(ipo => {
        db.run(
          "INSERT INTO ipos (name, openDate, closeDate, price, registrar) VALUES (?,?,?,?,?)",
          [ipo.symbol, ipo.openDate, ipo.closeDate, ipo.priceBand, ipo.registrar],
          err => {
            if (err) console.log("DB insert error:", err.message);
          }
        );
      });
    });

    console.log("IPO data updated:", ipos.length);
  } catch (e) {
    console.error("Error fetching NSE:", e.message);
  }
}


// Schedule: run every 6 hours
cron.schedule("0 */6 * * *", fetchNSE);

// API Routes
app.get("/", (req, res) => res.send("IPO App Backend Running ✅"));
app.get("/ipos", (req, res) => {
  db.all("SELECT * FROM ipos", [], (err, rows) => {
    if (err) res.status(500).send(err.message);
    else res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

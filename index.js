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
    const res = await axios.get("https://www.chittorgarh.com/newportal/ipo/ipo.json");
    const ipos = res.data || [];

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

    console.log("Chittorgarh IPOs updated:", ipos.length);
  } catch (e) {
    console.error("Error fetching Chittorgarh:", e.message);
  }
}

// ================== API Endpoint ==================
app.get("/ipos", (req, res) => {
  db.all("SELECT * FROM ipos*

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

let ipoData = [];

// Function to fetch IPO data from NSE
async function fetchNSE() {
  try {
    console.log("Fetching IPO data from NSE...");

    const res = await axios.get(
      "https://www.nseindia.com/api/ipo-current-issues",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.

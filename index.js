const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

let ipoData = [];

// Function to fetch IPO data using ScraperAPI
async function fetchNSE() {
  try {
    console.log("Fetching IPO data from NSE via ScraperAPI...");

    const res = await axios.get(
      `http://api.scraperapi.com`,
      {
        params: {
          api_key: "1d2578e68e15dcd3048637e178fffa2a", // your key
          url: "https://www.nseindia.com/api/ipo-current-issues"
        }
      }
    );

    if (res.data) {
      ipoData = res.data;
      console.log("IPO data updated:", ipoData.length || "some", "items");
    }
  } catch (err) {
    console.error("Error fetching IPO data:", err.message);
  }
}

// API endpoint
app.get("/ipos", (req, res) => {
  res.json(ipoData);
});

// Home route
app.get("/", (req, res) => {
  res.send("<h2>IPO App Running ✅</h2><p>Visit <a href='/ipos'>/ipos</a> for IPO data</p>");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Fetch once at startup
fetchNSE();

// Refresh every 1 hour
setInterval(fetchNSE, 1000 * 60 * 60);

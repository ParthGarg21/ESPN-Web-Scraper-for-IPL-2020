const cheerio = require("cheerio");
const request = require("request");
const getAll = require("./getAllMatches");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

let folderPath = path.join(__dirname, "IPL 2020");

makeDirectory(folderPath);
// console.log(getAll);
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

// Get Request on the homepage to get the home HTML body.

request(url, function (err, res, body) {
  if (err) {
    console.log("Error : ", err);
  } else {
    extractLink(body); // function to get the link of all the matches
  }
});

// function to get the link of all the matches

function extractLink(html) {
  let $ = cheerio.load(html);

  let btn = $(".widget-items a");

  let link = "https://www.espncricinfo.com/" + btn.attr("href");

  getAll.getAll(link);
}


function makeDirectory(folderPath) {
  if (fs.existsSync(folderPath) == false) {
    fs.mkdirSync(folderPath);
  }
}

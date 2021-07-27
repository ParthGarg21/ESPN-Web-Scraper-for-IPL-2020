const cheerio = require("cheerio");
const request = require("request");
const getMatch = require("./getMatch");

function getAllMatchesHtml(mtchUrl) {
  request(mtchUrl, function (err, res, body) {
    if (err) {
      console.log("Error : ", err);
    } else {
      getAllMatches(body);
    }
  });
}

function getAllMatches(html) {
  let $ = cheerio.load(html);

  let matches = $('[data-hover="Scorecard"]');

  for (match of matches) {
    let matchUrl = $(match).attr("href");
    getMatch.getMatch("https://www.espncricinfo.com/" + matchUrl);
  }
}

module.exports = {
  getAll : getAllMatchesHtml,
};

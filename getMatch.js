const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

function getMatch(url) {
    request(url, function (err, res, body) {
        if (err) {
            console.log("Error : ", err);
        } else {
            extractSingleMatch(body);
        }
    });
}

function extractSingleMatch(body) {
    let $ = cheerio.load(body);
    let teams = $(".Collapsible");

    let res = $(".match-header .status-text span").text();
    let details = $(".match-header .description").text();
    console.log(res);

    let arr = details.split(",");
    let venue = arr[1].trim();
    let date = arr[2].trim();

    for (let i = 0; i < 2; i++) {
        let myTeam = $(teams[i]);
        let oppTeam = $(teams[(i + 1) % 2]);

        let myTeamName = myTeam.find("h5").text();
        myTeamName = myTeamName.split("INNINGS")[0];
        myTeamName = myTeamName.trim();

        let oppTeamName = oppTeam.find("h5").text();
        oppTeamName = oppTeamName.split("INNINGS")[0];
        oppTeamName = oppTeamName.trim();

        let folderName = path.join(__dirname, "IPL 2020", myTeamName);

        makeDirectory(folderName);
        let players = myTeam.find(".batsman tbody tr");

        for (let i = 0; i < players.length; i++) {
            let player = $(players[i]).find("td");

            let isWorthy = $(player[0]).hasClass("batsman-cell");
            if (isWorthy) {
                let name = $(player[0]).text();
                let runs = $(player[2]).text();
                let balls = $(player[3]).text();
                let fours = $(player[5]).text();
                let sixes = $(player[6]).text();
                let sr = $(player[6]).text();
                name = name.trim();
                console.log(
                    `${myTeamName} , Name : ${name} , Runs :  ${runs} , Balls : ${balls} , Fours : ${fours} , Sixes : ${sixes} , Strike Rate : ${sr}`
                );
                processPlayer(myTeamName, name, runs, balls, fours, sixes, sr, oppTeamName, venue, date, res, folderName);
            }
        }
    }

    console.log(
        "-------------------------------------------------------------------------------------------------------------------- "
    );
}

function processPlayer(TeamName , PlayerName, Runs, Balls, Fours, Sixes, StrikeRate, OpponentName, Venue, Date, Result, teamPath) {
    let filePath = path.join(teamPath, PlayerName + ".xlsx");
    let content = excelReader(filePath, PlayerName);
    let playerObj = {
        TeamName,
        PlayerName,
        Runs,
        Balls,
        Fours,
        Sixes,
        StrikeRate,
        OpponentName,
        Venue,
        Date,
        Result
    }
    content.push(playerObj);
    excelWriter(filePath, content, PlayerName);
}

function makeDirectory(folderPath) {
    if (fs.existsSync(folderPath) == false) {
        fs.mkdirSync(folderPath);
    }
}

function excelWriter(filePath, json, sheetName) {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}


function excelReader(filePath, sheetName) {
    if (fs.existsSync(filePath) == false) {
        return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}

module.exports = {
    getMatch: getMatch,
};

var net = require("net");
const chalk = require('chalk');
const request = require('request');
let ipData = {};
let validShares = 0;
let invalidShares = 0;

// This is your config, please change this
let workerApi = "http://pool.vectorium.co/api/worker_stats?";
let localport = 1000; // Localhost port
let remotehost = "pool.vectorium.co"; // Pool IP/hostname
let remoteport = 1000; // Pool port

// Clear console
console.clear();

process.on("uncaughtException", function (error) {
  console.error(error);
});

function convertTimestamp () {
  let d = new Date(),
      yyyy = d.getFullYear(),
      mm = (d.getMonth() + 1)
      .toString()
      .padStart(2, '0'),
      dd = d
      .getDate()
      .toString()
      .padStart(2, '0'),
      hh = d.getHours(),
      h = hh,
      min = d
      .getMinutes()
      .toString()
      .padStart(2, '0'),
      ampm = "AM",
      ss = d
      .getSeconds()
      .toString()
      .padStart(2, '0'),
      ms = d
      .getMilliseconds()
      .toString()
      .padStart(2, '0');

  if (hh > 12) {
      h = hh - 12;
      ampm = "PM";
  } else if (hh === 12) {
      h = 12;
      ampm = "PM";
  } else if (hh === 0) {
      h = 12;
  }

  return `${dd}-${mm}-${yyyy} ${h}:${min}:${ss} ${ampm}`;
}

function log(color, type, ...message) {
  console.log(
    `[${convertTimestamp()}]`,
    color(`[${type}] ` + message.join(" "))
  );
}

var server = net.createServer(function (localsocket) {
  function showData(data) {
    try {
      let objData = JSON.parse(data);
      if(objData.method == "mining.submit") {
        log(chalk.green, "SHARE", ` ${chalk.gray("[" + ipData[localsocket.remoteAddress + localsocket.remotePort][0] + "] [" + localsocket.remoteAddress.replace("::ffff:", "") + ":" + localsocket.remotePort + "]")} Miner has submitted a valid share`);
        
        ipData[localsocket.remoteAddress + localsocket.remotePort][1] += 1;
        validShares += 1;
        
        log(chalk.cyan, "STATS", ` ${chalk.gray("[" + ipData[localsocket.remoteAddress + localsocket.remotePort][0] + "] [" + localsocket.remoteAddress.replace("::ffff:", "") + ":" + localsocket.remotePort + "]")} ${chalk.green("Valid Shares: " + ipData[localsocket.remoteAddress + localsocket.remotePort][1] + " (" + validShares + ")")} / ${chalk.red("Invalid Shares: " + ipData[localsocket.remoteAddress + localsocket.remotePort][2] + " (" + invalidShares + ")")}`);
        
        request(workerApi + ipData[localsocket.remoteAddress + localsocket.remotePort][0].split(".")[0], {json: true}, (error, res, body) => {
          if (error) {
            return  console.log(error)
          };
          if (!error && res.statusCode == 200) {
            log(chalk.hex("#618bff"), "COINS", ` ${chalk.gray("[" + ipData[localsocket.remoteAddress + localsocket.remotePort][0].split(".")[0] + "]")} ${chalk.yellow("Immature: " + body.immature.toLocaleString('en-US'))} / ${chalk.magenta("Balance: " + body.balance.toLocaleString('en-US'))} / ${chalk.green("Paid: " + body.paid.toLocaleString('en-US'))}`);
          };
        });
      }
      if(objData.method == "mining.authorize") {
        ipData[localsocket.remoteAddress + localsocket.remotePort] = [objData.params[0], 0, 0 ];
        log(chalk.yellow, "AUTH", `  ${chalk.gray("[" + ipData[localsocket.remoteAddress + localsocket.remotePort][0] + "] [" + localsocket.remoteAddress.replace("::ffff:", "") + ":" + localsocket.remotePort + "]")} Miner has been authorized`);
      }
      if(objData.method == "mining.notify") {
        log(chalk.hex('#f5b642'), "JOB", `   ${chalk.gray("[" + ipData[localsocket.remoteAddress + localsocket.remotePort][0] + "] [" + localsocket.remoteAddress.replace("::ffff:", "") + ":" + localsocket.remotePort + "]")} New job recieved '${objData.params[0]}'`);
      }
    } catch(e) {

    }
  }

  var remotesocket = new net.Socket();

  remotesocket.connect(remoteport, remotehost);

  localsocket.on('connect', function (data) {
    console.log(">>> connection #%d from %s:%d",
      server.connections,
      localsocket.remoteAddress,
      localsocket.remotePort
    );
  });

  localsocket.on('data', function (data) {
    showData(data.toString('utf8'));
    
    var flushed = remotesocket.write(data);
    if (!flushed) {
      console.log("  remote not flushed; pausing local");
      localsocket.pause();
    }
  });

  remotesocket.on('data', function (data) {
    showData(data.toString('utf8'));

    var flushed = localsocket.write(data);
    if (!flushed) {
      console.log("  local not flushed; pausing remote");
      remotesocket.pause();
    }
  });

  localsocket.on('drain', function () {
    console.log("%s:%d - resuming remote",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    remotesocket.resume();
  });

  remotesocket.on('drain', function () {
    console.log("%s:%d - resuming local",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    localsocket.resume();
  });

  localsocket.on('close', function (had_error) {
    console.log("%s:%d - closing remote",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    remotesocket.end();
  });

  remotesocket.on('close', function (had_error) {
    console.log("%s:%d - closing local",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    localsocket.end();
  });

});

server.listen(localport);

log(chalk.hex('#61ffa0'), "SERVER", `Redirecting traffic from 0.0.0.0:${localport} to ${remotehost}:${remoteport}`);
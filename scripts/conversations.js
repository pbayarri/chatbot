const querywit = require('../src/query-wit.js').querywit;

module.exports = (robot) => {

  robot.respond(/(.*)/, (msg) => {
    querywit(robot, msg);
  });

  /*robot.respond(/(.*)Hello(.*)/, (msg) => {
    msg.send("Hello!!!!");
  });*/
}

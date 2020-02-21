const actions = require('../src/actions.js');
const config = require('../resources/config.json');
const { Wit, log } = require('node-wit');

const MAX_N = 3;
const MAX_TIME = 60000;
const THRESHOLD = config.confidenceThreshold;

const witClient = new Wit({
  accessToken: config.witToken,
  logger: new log.Logger(log.DEBUG)
});

function getUserName(msg) {
  return msg.envelope.user.name;
}

function getRetries(robot) {
  return robot.brain.get('retries') || {};
}

function getUserRetries(robot, msg) {
  const userName = getUserName(msg);
  const retries = getRetries(robot);
  return retries[userName] || {};
}

function validateRetries(robot, msg) {
  const userRetries = getUserRetries(robot, msg);

  if (userRetries.timestamp && Date.now() - userRetries.timestamp > MAX_TIME) { return false; }
  if (userRetries.N && userRetries.N >= MAX_N) { return false; }

  return true;
}

function validateConfidence(entities) {
  //const bestIntent = getBestIntent(entities);
  //if (!bestIntent || bestIntent.confidence < THRESHOLD) { return false; }
  return true;
}

function deleteRetries(robot, msg) {
  const userName = getUserName(msg);
  const retries = getRetries(robot);
  retries[userName] = undefined;
  robot.brain.set('retries', retries);
}

function incrementRetries(robot, msg) {
  const userName = getUserName(msg);
  const retries = getRetries(robot);
  const userRetries = getUserRetries(robot, msg);
  userRetries.N = (userRetries.N || 0) + 1;
  userRetries.timestamp = Date.now();
  retries[userName] = userRetries;
  robot.brain.set('retries', retries);
}

function getBestIntent(entities) {
  const intents = entities['intent'] || [];
  return intents[0];
}

module.exports = {
  querywit: (robot, msg) => {
    const message = msg.match[1];

    if (validateRetries(robot, msg)) {
      incrementRetries(robot, msg);
      witClient.message(message)
        .then((data) => {
          const entities = data.entities;
          if (validateConfidence(entities)) {
            const bestIntent = getBestIntent(entities);
            deleteRetries(robot, msg);
            if (actions[bestIntent.value]) {
              actions[bestIntent.value](robot, msg, entities);
            } else {
               msg.send(`Ok, I understand you want ${bestIntent.value} but I don't know how to do it.`);
            }
          } else {
             msg.send('Can you be more specific?');
          }
        })
        .catch(() => {
          msg.send('My AI is not working!! OMG');
        });
    } else {
      deleteRetries(robot, msg);
      msg.send(`Sorry, I didn't understand you`);
    }
  }
};

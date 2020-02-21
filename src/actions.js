const NETWORKS = 'network';

function validateConfidence(entity) {
  if (!entity || entity.confidence < THRESHOLD) { return false; }
  return true;
}

module.exports = {
  reboot: (robot, msg, entities) => {
    //const network = entities[NETWORKS];
    //const bestNetwork = network[0];

    //if (validateConfidence(bestNetwork)) {
      //msg.send(`I'm rebooting the network ${bestNetwork}`);
      msg.send(`I'm rebooting the network. We are working on know the concrete network`);
    //} else {
      //msg.send('I don't know what network I must reboot);
    //}
  }
};

const VRFv2Consumer = artifacts.require('VRFv2Consumer');

module.exports = function (deployer) {
  deployer.deploy(VRFv2Consumer(3853));
};

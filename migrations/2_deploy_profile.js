const ProfileRegistry = artifacts.require("ProfileRegistry");

module.exports = function (deployer) {
    deployer.deploy(ProfileRegistry);
};

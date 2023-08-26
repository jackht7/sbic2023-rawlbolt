const reportTicket = artifacts.require('./ReportTickets.sol');

module.exports = function (deployer) {
  deployer.deploy(reportTicket);
};

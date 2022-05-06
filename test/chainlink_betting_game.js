const ChainLinkBettingGame = artifacts.require('ChainLinkBettingGame');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('ChainLinkBettingGame', function (/* accounts */) {
  it('should assert true', async function () {
    await ChainLinkBettingGame.deployed();
    return assert.isTrue(true);
  });
});

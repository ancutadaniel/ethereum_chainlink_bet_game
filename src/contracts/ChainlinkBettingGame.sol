// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';

/**
 * @notice A Chainlink VRF consumer which uses randomness to mimic the rolling
 * of a 20 sided dice
 * @dev This is only an example implementation and not necessarily suitable for mainnet.
 */
contract VRFD2 is VRFConsumerBaseV2 {
    uint256 private constant ROLL_IN_PROGRESS = 42;

    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // Rinkeby coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 s_keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 40,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 40000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 1;
    address s_owner;

    // Game info
    uint256 public gameId;
    uint256 public lastGameId;
 

    struct Game{
        uint256 id;
        uint256 bet;        
        uint256 amount;
        address payable player;
    }

    // map games
    mapping(uint256 => Game) public games;
    // map rollers to requestIds
    mapping(uint256 => address) private s_rollers;
    // map vrf results to rollers
    mapping(address => uint256) private s_results;

    event DiceRolled(uint256 indexed requestId, address indexed roller);
    event DiceLanded(uint256 indexed requestId, uint256 indexed result);
    event Received(address indexed sender, uint indexed value);
    event Result(uint256 id, uint256 bet, uint256 amount, address player, uint256 winAmount, uint256 randomResult, uint256 time);

     /* Allows this contract to receive payments */
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @notice Constructor inherits VRFConsumerBaseV2
     *
     * @dev NETWORK: RINKEBY
     *
     * @param subscriptionId subscription id that this consumer contract can use
     */
    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
    }

    /**
     * @notice Requests randomness
     * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
     * as that would give miners/VRF operators latitude about which VRF response arrives first.
     * @dev You must review your implementation details with extreme care.
     *
     * @param roller address of the roller
     */
    function rollDice(address roller) public returns (uint256 requestId) {
        // require(s_results[roller] == 0, 'Already rolled');
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_rollers[requestId] = roller;
        s_results[roller] = ROLL_IN_PROGRESS;
        emit DiceRolled(requestId, roller);
    }

    /**
     * @notice Callback function used by VRF Coordinator to return the random number to this contract.
     *
     * @dev Some action on the contract state should be taken here, like storing the result.
     * @dev WARNING: take care to avoid having multiple VRF requests in flight if their order of arrival would result
     * in contract states with different outcomes. Otherwise miners or the VRF operator would could take advantage
     * by controlling the order.
     * @dev The VRF Coordinator will only send this function verified responses, and the parent VRFConsumerBaseV2
     * contract ensures that this method only receives randomness from the designated VRFCoordinator.
     *
     * @param requestId uint256
     * @param randomWords  uint256[] The random result returned by the oracle.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 d2Value = (randomWords[0] % 2) + 1;
        s_results[s_rollers[requestId]] = d2Value;
        verdict(d2Value);
        emit DiceLanded(requestId, d2Value);
    }

    /**
     * @notice Get the house assigned to the player once the address has rolled
     * @param player address
     * @return house as a string
     */
    function game(address player, uint bet) public payable returns (bool) {
        require(s_results[player] != 0, 'Dice not rolled');
        require(s_results[player] != ROLL_IN_PROGRESS, 'Roll in progress');

        //vault balance must be at least equal to msg.value
        require(address(this).balance >= msg.value, "Error, insufficent vault balance");

        //each bet has unique id
        games[gameId] = Game(gameId, bet, msg.value, payable(msg.sender));
        
        //increase gameId for the next bet
        gameId += 1;      
        
        return true;
    }

    /**
     * Send rewards to the winners.
    */
    function verdict(uint256 random) public payable onlyVFRC {
        //check bets from latest betting round, one by one
        for(uint256 i = lastGameId; i < gameId; i++){
        //reset winAmount for current user
        uint256 winAmount = 0;
        
        //if user wins, then receives 2x of their betting amount
        if((random == 1 && games[i].bet==1) || (random == 0 && games[i].bet==0)){
            winAmount = games[i].amount*2;
            games[i].player.transfer(winAmount);
        }
        emit Result(games[i].id, games[i].bet, games[i].amount, games[i].player, winAmount, random, block.timestamp);
        }
        //save current gameId to lastGameId for the next betting round
        lastGameId = gameId;
    }
    
    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }

    modifier onlyVFRC() {
        require(msg.sender == vrfCoordinator, "only VFRC can call this function");
        _;
    } 
}

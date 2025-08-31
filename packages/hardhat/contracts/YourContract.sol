//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

/**
 * Incentifi - Simplified Gamified Chore dApp for XDC Network
 * Select chores, mint NFTs, burn for rewards with lottery bonus
 * @author Your Name - XDC Vibe Bootcamp
 */
contract YourContract is ERC721, Ownable {
    using Strings for uint256;

    // Enums
    enum ChoreType { TakeOutGarbage, WashDishes, WalkDog, DoHomework, MowLawn }
    enum NFTType { ChoreNFT, AchievementBadge }

    // Structs
    struct Chore {
        string name;
        string description;
        uint256 reward;
        uint256 timeLimit; // in hours
    }

    struct UserChore {
        ChoreType choreType;
        uint256 startTime;
        uint256 deadline;
        bool completed;
        bool redeemed;
    }

    struct NFTMetadata {
        ChoreType choreType;
        NFTType nftType;
        uint256 mintedAt;
        bool isActive;
    }

    // State Variables
    uint256 private _nextTokenId = 1;
    
    mapping(ChoreType => Chore) public chores;
    mapping(address => mapping(ChoreType => UserChore)) public userChores;
    mapping(address => uint256[]) public userNFTs;
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256) public userAchievementCount;
    mapping(address => uint256) public userTotalRewards;
    mapping(address => mapping(ChoreType => uint256)) public userChoreCompletionCount;
    
    uint256 public totalChoresCompleted = 0;
    uint256 public totalRewardsPaid = 0;
    uint256 public lotteryChance = 10; // 10% chance
    uint256 public lotteryMultiplier = 2; // 2x reward bonus

    // Events
    event ChoreSelected(address indexed user, ChoreType choreType, uint256 nftId, uint256 deadline);
    event ChoreCompleted(address indexed user, ChoreType choreType);
    event RewardClaimed(address indexed user, ChoreType choreType, uint256 reward, bool lotteryWin, uint256 achievementNFT);
    event NFTMinted(uint256 indexed tokenId, address indexed to, NFTType nftType, ChoreType choreType);
    event NFTBurned(uint256 indexed tokenId);

    constructor(address initialOwner) ERC721("Incentifi NFT", "INCH") Ownable(initialOwner) {
        // Initialize 5 hardcoded chores with rewards and time limits
        chores[ChoreType.TakeOutGarbage] = Chore({
            name: "Take Out Garbage",
            description: "Take the garbage bins to the curb for pickup",
            reward: 0.1 ether, // 0.1 ETH
            timeLimit: 2 // 2 hours
        });

        chores[ChoreType.WashDishes] = Chore({
            name: "Wash Dishes",
            description: "Wash and dry all dishes in the sink",
            reward: 0.05 ether, // 0.05 ETH
            timeLimit: 1 // 1 hour
        });

        chores[ChoreType.WalkDog] = Chore({
            name: "Walk Dog",
            description: "Take the dog for a 20-minute walk",
            reward: 0.08 ether, // 0.08 ETH
            timeLimit: 3 // 3 hours
        });

        chores[ChoreType.DoHomework] = Chore({
            name: "Do Homework",
            description: "Complete all assigned homework",
            reward: 0.15 ether, // 0.15 ETH
            timeLimit: 24 // 24 hours
        });

        chores[ChoreType.MowLawn] = Chore({
            name: "Mow Lawn",
            description: "Mow the entire lawn and clean up clippings",
            reward: 0.2 ether, // 0.2 ETH
            timeLimit: 6 // 6 hours
        });
    }

    /**
     * Select a chore and mint NFT - simplified approach
     */
    function selectChore(ChoreType _choreType) external {
        require(userChores[msg.sender][_choreType].startTime == 0 || userChores[msg.sender][_choreType].redeemed, "Chore already active");
        
        Chore memory chore = chores[_choreType];
        uint256 deadline = block.timestamp + (chore.timeLimit * 1 hours);
        
        // Update user chore
        userChores[msg.sender][_choreType] = UserChore({
            choreType: _choreType,
            startTime: block.timestamp,
            deadline: deadline,
            completed: false,
            redeemed: false
        });
        
        // Mint chore NFT
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        nftMetadata[tokenId] = NFTMetadata({
            choreType: _choreType,
            nftType: NFTType.ChoreNFT,
            mintedAt: block.timestamp,
            isActive: true
        });
        
        userNFTs[msg.sender].push(tokenId);
        
        emit ChoreSelected(msg.sender, _choreType, tokenId, deadline);
        emit NFTMinted(tokenId, msg.sender, NFTType.ChoreNFT, _choreType);
    }
    
    /**
     * Mark chore as completed (self-reported)
     */
    function completeChore(ChoreType _choreType) external {
        UserChore storage userChore = userChores[msg.sender][_choreType];
        require(userChore.startTime > 0, "Chore not started");
        require(!userChore.completed, "Chore already completed");
        require(block.timestamp <= userChore.deadline, "Chore deadline passed");
        
        userChore.completed = true;
        userChoreCompletionCount[msg.sender][_choreType]++;
        
        emit ChoreCompleted(msg.sender, _choreType);
    }
    
    /**
     * Burn NFT for reward with lottery bonus
     */
    function burnForReward(ChoreType _choreType) external payable {
        UserChore storage userChore = userChores[msg.sender][_choreType];
        require(userChore.completed, "Chore not completed");
        require(!userChore.redeemed, "Reward already claimed");
        
        // Find and burn the chore NFT
        uint256 choreNFTId = _findChoreNFT(_choreType, msg.sender);
        require(choreNFTId != 0, "Chore NFT not found");
        
        nftMetadata[choreNFTId].isActive = false;
        _burn(choreNFTId);
        emit NFTBurned(choreNFTId);
        
        // Check for lottery win (10% chance)
        bool lotteryWin = _checkLottery();
        uint256 baseReward = chores[_choreType].reward;
        uint256 finalReward = lotteryWin ? baseReward * lotteryMultiplier : baseReward;
        
        // Mint achievement badge NFT
        uint256 achievementTokenId = _nextTokenId++;
        _safeMint(msg.sender, achievementTokenId);
        
        nftMetadata[achievementTokenId] = NFTMetadata({
            choreType: _choreType,
            nftType: NFTType.AchievementBadge,
            mintedAt: block.timestamp,
            isActive: true
        });
        
        userNFTs[msg.sender].push(achievementTokenId);
        userAchievementCount[msg.sender]++;
        userTotalRewards[msg.sender] += finalReward;
        
        // Mark as redeemed
        userChore.redeemed = true;
        totalChoresCompleted++;
        totalRewardsPaid += finalReward;
        
        // Transfer reward
        require(address(this).balance >= finalReward, "Insufficient contract balance");
        (bool success, ) = msg.sender.call{value: finalReward}("");
        require(success, "Reward transfer failed");
        
        emit RewardClaimed(msg.sender, _choreType, finalReward, lotteryWin, achievementTokenId);
        emit NFTMinted(achievementTokenId, msg.sender, NFTType.AchievementBadge, _choreType);
    }

    // View Functions
    function getChore(ChoreType _choreType) external view returns (Chore memory) {
        return chores[_choreType];
    }
    
    function getUserChore(address _user, ChoreType _choreType) external view returns (UserChore memory) {
        return userChores[_user][_choreType];
    }
    
    function getUserNFTs(address _user) external view returns (uint256[] memory) {
        return userNFTs[_user];
    }
    
    function getNFTMetadata(uint256 _tokenId) external view returns (NFTMetadata memory) {
        return nftMetadata[_tokenId];
    }
    
    function getUserStats(address _user) external view returns (
        uint256 achievementCount,
        uint256 totalRewards,
        uint256[] memory userNFTList
    ) {
        return (
            userAchievementCount[_user],
            userTotalRewards[_user],
            userNFTs[_user]
        );
    }
    
    function getUserChoreCompletionCounts(address _user) external view returns (uint256[5] memory) {
        uint256[5] memory counts;
        for (uint i = 0; i < 5; i++) {
            counts[i] = userChoreCompletionCount[_user][ChoreType(i)];
        }
        return counts;
    }
    
    function getAllChores() external view returns (
        string[5] memory names,
        string[5] memory descriptions,
        uint256[5] memory rewards,
        uint256[5] memory timeLimits
    ) {
        for (uint i = 0; i < 5; i++) {
            ChoreType choreType = ChoreType(i);
            Chore memory chore = chores[choreType];
            names[i] = chore.name;
            descriptions[i] = chore.description;
            rewards[i] = chore.reward;
            timeLimits[i] = chore.timeLimit;
        }
    }

    // Internal Functions
    function _checkLottery() private view returns (bool) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;
        return randomNumber < lotteryChance;
    }
    
    function _findChoreNFT(ChoreType _choreType, address _owner) private view returns (uint256) {
        uint256[] memory ownerNFTs = userNFTs[_owner];
        for (uint256 i = 0; i < ownerNFTs.length; i++) {
            uint256 tokenId = ownerNFTs[i];
            if (nftMetadata[tokenId].choreType == _choreType && 
                nftMetadata[tokenId].nftType == NFTType.ChoreNFT && 
                nftMetadata[tokenId].isActive) {
                return tokenId;
            }
        }
        return 0;
    }

    // Owner Functions
    function setLotteryChance(uint256 _chance) external onlyOwner {
        require(_chance <= 100, "Chance must be <= 100");
        lotteryChance = _chance;
    }

    function setLotteryMultiplier(uint256 _multiplier) external onlyOwner {
        require(_multiplier >= 1, "Multiplier must be >= 1");
        lotteryMultiplier = _multiplier;
    }
    
    function fundContract() external payable onlyOwner {
        // Allow owner to fund contract for rewards
    }

    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        NFTMetadata memory metadata = nftMetadata[tokenId];
        Chore memory chore = chores[metadata.choreType];
        
        string memory nftTypeStr = metadata.nftType == NFTType.ChoreNFT ? "Chore Task" : "Achievement Badge";
        string memory statusStr = metadata.nftType == NFTType.ChoreNFT ? "⏳ Pending Completion" : "🏆 Completed & Claimed";
        string memory emoji = _getChoreEmoji(metadata.choreType);
        string memory svgImage = _generateNFTImage(metadata.choreType, metadata.nftType);
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(abi.encodePacked(
                '{"name":"', emoji, ' ', chore.name, ' - ', nftTypeStr, '",',
                '"description":"', _getDetailedDescription(metadata.choreType, metadata.nftType), '",',
                '"image":"data:image/svg+xml;base64,', _base64Encode(bytes(svgImage)), '",',
                '"attributes":[',
                '{"trait_type":"Type","value":"', nftTypeStr, '"},',
                '{"trait_type":"Chore","value":"', chore.name, '"},',
                '{"trait_type":"Status","value":"', statusStr, '"},',
                '{"trait_type":"Reward","value":"', Strings.toString(chore.reward / 1 ether), ' XDC"},',
                '{"trait_type":"Time Limit","value":"', Strings.toString(chore.timeLimit), ' hours"},',
                '{"trait_type":"Minted At","value":"', Strings.toString(metadata.mintedAt), '"}',
                ']}'
            )))
        ));
    }

    function _getChoreEmoji(ChoreType _choreType) private pure returns (string memory) {
        if (_choreType == ChoreType.TakeOutGarbage) return "🗑️";
        if (_choreType == ChoreType.WashDishes) return "🍽️";
        if (_choreType == ChoreType.WalkDog) return "🐕";
        if (_choreType == ChoreType.DoHomework) return "📚";
        if (_choreType == ChoreType.MowLawn) return "🌱";
        return "⭐";
    }
    
    function _getDetailedDescription(ChoreType _choreType, NFTType _nftType) private view returns (string memory) {
        Chore memory chore = chores[_choreType];
        
        if (_nftType == NFTType.ChoreNFT) {
            return string(abi.encodePacked(
                "🎯 ACTIVE CHORE: ", chore.name, " | ",
                "💰 Reward: ", Strings.toString(chore.reward / 1 ether), " XDC | ",
                "⏰ Time Limit: ", Strings.toString(chore.timeLimit), " hours | ",
                "📝 Task: ", chore.description, " | ",
                "🎲 10% chance for 2x lottery bonus!"
            ));
        } else {
            return string(abi.encodePacked(
                "🏆 ACHIEVEMENT UNLOCKED: ", chore.name, " completed! | ",
                "💎 This badge proves you successfully finished the task | ",
                "🎮 Part of your Incentifi achievement collection | ",
                "🌟 Keep completing chores to earn more badges!"
            ));
        }
    }
    
    function _generateNFTImage(ChoreType _choreType, NFTType _nftType) private pure returns (string memory) {
        string memory emoji = _getChoreEmoji(_choreType);
        string memory bgColor = _nftType == NFTType.ChoreNFT ? "#3B82F6" : "#10B981";
        string memory borderColor = _nftType == NFTType.ChoreNFT ? "#1E40AF" : "#047857";
        string memory statusText = _nftType == NFTType.ChoreNFT ? "PENDING" : "COMPLETED";
        
        return string(abi.encodePacked(
            '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', bgColor, ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:', borderColor, ';stop-opacity:1" />',
            '</linearGradient>',
            '<filter id="glow">',
            '<feGaussianBlur stdDeviation="3" result="coloredBlur"/>',
            '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>',
            '</filter>',
            '</defs>',
            '<rect width="400" height="400" fill="url(#bg)" rx="20"/>',
            '<rect x="20" y="20" width="360" height="360" fill="none" stroke="white" stroke-width="3" rx="15" opacity="0.3"/>',
            '<text x="200" y="120" font-family="Arial, sans-serif" font-size="80" text-anchor="middle" fill="white" filter="url(#glow)">',
            emoji,
            '</text>',
            '<text x="200" y="200" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">',
            'INCENTIFI',
            '</text>',
            '<text x="200" y="240" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white" opacity="0.9">',
            statusText,
            '</text>',
            '<text x="200" y="320" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white" opacity="0.8">',
            _nftType == NFTType.ChoreNFT ? "Complete to claim reward" : "Achievement Unlocked",
            '</text>',
            _nftType == NFTType.ChoreNFT ? 
                '<circle cx="200" cy="350" r="8" fill="yellow" opacity="0.8"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>' :
                '<polygon points="200,280 210,300 230,300 216,314 222,334 200,322 178,334 184,314 170,300 190,300" fill="gold"><animateTransform attributeName="transform" type="rotate" values="0 200 307;360 200 307" dur="3s" repeatCount="indefinite"/></polygon>',
            '</svg>'
        ));
    }

    function _base64Encode(bytes memory data) private pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        if (data.length == 0) return "";
        
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, add(i, 32))), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return result;
    }

    // Allow contract to receive ETH for rewards
    receive() external payable {}
}

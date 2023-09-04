// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
// import "truffle/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';
import './HexStrings.sol';

contract ReportTickets is ERC721Enumerable, Ownable {
  using Strings for uint256;
  using HexStrings for uint160;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  uint16 _myTotalSupply = 0; // max value 65,535
  address _owner;

  uint16 public MAX_SUPPLY = 10000; // max value 65,535
  uint256 public constant milestoneTicketPrice = 20000000000000000; // 0.02 ETH
  uint256 public constant generalTicketPrice = 10000000000000000; // 0.01 ETH
  // uint256 mintDeadline = block.timestamp + (720 hours);

  mapping (uint256 => bool) public milestoneTicketHolders;
  mapping (uint256 => bytes3) public color;

  constructor() ERC721("ReportTickets", "RPTX") {
    _tokenIds._value = 0;
    _owner = msg.sender;
  }

  struct MintingRequest {
    address minter;
    bool approved;
    string status;
  }

  mapping(uint256 => MintingRequest) public mintingRequests;

  // TODO: add listener?
  // event MintingRequestApproved(uint256 indexed tokenId, address indexed minter);
  // event MintingRequestRejected(uint256 indexed tokenId, address indexed minter);


  function totalSupply() view public override returns(uint256) {
    return _myTotalSupply; // gas optimization (otherwise totalSupply() when mint)
  }

  /**
    * @dev Returns the tokens owned by a given wallet. For use mainly on frontend.
    * @param _wallet The wallet to get the tokens of. NEEDS ENUMERABLE
  */
  function walletOfOwner(address _wallet) public view returns (uint256[] memory) {
    uint256 tokenCount = balanceOf(_wallet);
    uint256[] memory tokensId = new uint256[](tokenCount);
    for (uint256 i; i < tokenCount; i++) {
      tokensId[i] = tokenOfOwnerByIndex(_wallet, i);
    }
    return tokensId;
  }

  function contractURI() public pure returns (string memory) {
    bytes memory collectionJsonString = bytes(abi.encodePacked(
      '{"name":"RPTX",',
      '"description":"Report TIckets"}'
      // '"image":"data:image/svg+xml;base64,',image,'",'
      // '"external_link":""}'
    ));

    return string(
      abi.encodePacked(
        'data:application/json;base64,',
        Base64.encode(bytes(abi.encodePacked(collectionJsonString)))
      )
    );
  }

  modifier canMint() {
    // require(block.timestamp < mintDeadline, 'Minting expired');
    require(_myTotalSupply < MAX_SUPPLY, 'All tickets minted');
    require(milestoneTicketPrice == msg.value || generalTicketPrice == msg.value, "Ether value sent incorrect");
    _; // Underscores used in function modifiers return and continue execution of the decorated function
  }

  function mintNFT() public payable canMint returns (uint256) {
    _tokenIds.increment();
    uint256 id = _tokenIds.current();

    // Create a minting request
    mintingRequests[id] = MintingRequest(msg.sender, false, 'pending');

    // TODO: to only issue NFT after approval and add transfer ownership
    _safeMint(msg.sender, id);

    if (msg.value == milestoneTicketPrice) {
      milestoneTicketHolders[id] = true;
    }

    _myTotalSupply++;
    payable(_owner).transfer(msg.value);

    // console.log("dev output: Your token id is: %d", id);
    return (id);
  }

  function approveMinting(uint256 tokenId) payable external onlyOwner {
    MintingRequest storage request = mintingRequests[tokenId];
    require(!request.approved, "Request already approved");
    request.approved = true;
    request.status = 'approved';

    // TODO: issue payment
    payable(request.minter).transfer(msg.value);
  }

  function rejectMinting(uint256 tokenId) payable external onlyOwner {
    MintingRequest storage request = mintingRequests[tokenId];
    require(!request.approved, "Request already approved");
    request.approved = false;
    request.status = 'rejected';
    // delete mintingRequests[tokenId];

    // Refund the minter's Ether
    payable(request.minter).transfer(msg.value);
  }

  function tokenURI(uint256 id) public view override returns (string memory) {
    require(_exists(id), "not exist");
    string memory name = string(abi.encodePacked('Ticket #', id.toString() ));
    string memory description = string(abi.encodePacked((milestoneTicketHolders[id] ? "MILESTONE" : "REPORT"), ' Access'));

    bytes memory tokenJsonString = bytes(abi.encodePacked(
      '{"name":"',name,'","description":"',description,'",', 
      // '"external_url":"https://",',
      '"attributes":[{"trait_type":"Ticket Type", "value":"', (milestoneTicketHolders[id] ? "MILESTONE" : "REPORT"),  '"}],',
      '"owner":"', (uint160(ownerOf(id))).toHexString(20),'",'
      // '"image":"''"}'
    ));

    return string(
      abi.encodePacked(
        'data:application/json;base64,',
        Base64.encode(bytes(tokenJsonString))
      )
    );
  }

}
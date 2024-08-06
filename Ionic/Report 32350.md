
# claimRewards using transfer to transfer RewardToken might cause claimRewards transaction to fail in case the rewardToken contract does not return a bool value and all users cannot claim rewards

Submitted on Wed Jun 19 2024 03:32:56 GMT-0400 (Atlantic Standard Time) by @perseverance for [IOP | Ionic](https://immunefi.com/bounty/ionic-iop/)

Report ID: #32350

Report type: Smart Contract

Target: https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol

Impacts:
- Permanent freezing of unclaimed yield
- Permanent freezing of unclaimed royalties

## Description

# Description
## Brief/Intro

Owners of the LeveredPosition can claimRewards using 2 functions in LeveredPosition contract. 

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L144-L164

```solidity
function claimRewards() public {
    claimRewards(msg.sender);
  }

  function claimRewards(address withdrawTo) public {
    if (msg.sender != positionOwner && msg.sender != address(factory)) revert NotPositionOwner();

    address[] memory flywheels = pool.getRewardsDistributors();

    for (uint256 i = 0; i < flywheels.length; i++) {
      IonicFlywheel fw = IonicFlywheel(flywheels[i]);
      fw.accrue(ERC20(address(collateralMarket)), address(this));
      fw.accrue(ERC20(address(stableMarket)), address(this));
      fw.claimRewards(address(this));
      ERC20 rewardToken = fw.rewardToken();
      uint256 rewardsAccrued = rewardToken.balanceOf(address(this));
      if (rewardsAccrued > 0) {
        rewardToken.transfer(withdrawTo, rewardsAccrued);
      }
    }
  }

```

So the claimRewards will first claim rewards from all flywheels and then transfer rewardToken to the WithdrawTo address. 

## The vulnerability 
### Vulnerability Details

The vulnerability here is that the action to transfer rewardToken use the function transfer. 

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L158C7-L162C8
```
    ERC20 rewardToken = fw.rewardToken();
      uint256 rewardsAccrued = rewardToken.balanceOf(address(this));
      if (rewardsAccrued > 0) {
        rewardToken.transfer(withdrawTo, rewardsAccrued);
      }
```

The reward token here is using the ERC20 interface from Solmate 
https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L12
```
import { ERC20 } from "solmate/tokens/ERC20.sol";
```


https://github.com/transmissions11/solmate/blob/62e0943c013a66b2720255e2651450928f4eed7a/src/tokens/ERC20.sol#L76-L88

```solidity
    function transfer(address to, uint256 amount) public virtual returns (bool) {
        balanceOf[msg.sender] -= amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            balanceOf[to] += amount;
        }

        emit Transfer(msg.sender, to, amount);

        return true;
    }

```

This transfer function in Solmate library do require the token to return a boolean value. 

It is important to note that the transfer functions of some tokens (e.g., USDT, BNB) do not return any values, so these tokens are incompatible with the current version of the contract. 


USDT contract: 
https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7#code

```solidity
function transfer(address _to, uint _value) public onlyPayloadSize(2 * 32) {
        uint fee = (_value.mul(basisPointsRate)).div(10000);
        if (fee > maximumFee) {
            fee = maximumFee;
        }
        uint sendAmount = _value.sub(fee);
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(sendAmount);
        if (fee > 0) {
            balances[owner] = balances[owner].add(fee);
            Transfer(msg.sender, owner, fee);
        }
        Transfer(msg.sender, _to, sendAmount);
    }
```



# Impacts
## About the severity assessment

When the rewardToken is a token contract that does not return a boolean value (e.g. USDT) then the transaction claimRewards will be reverted. So there are different flywheels with different reward Tokens, but if just one token is not compatible, then the whole transaction will be reverted.

**It is important to note that currently safeTransfer and safeTransferFrom is being used extensively in other places of Ionic Codebase so for this token, e.g. USDT the integration works well in other contracts.**

But with LeveredPostion, the bug will make the positionOwner cannot claim his rewards. 
So in this situation, all rewards of all owners cannot be claimed and will be frozen in flywheels contracts. 
**As the Ionic Money LeveredPosition will be deployed on many chains as stated by the CTO of Ionic Money, this scenario is very likely to happen in one of the chains.**
It is important to fix this issue to avoid the freezing of unclaimed yieds or rewards. 

The claimReward should use safeTransfer here instead of transfer. The safeTransfer is being used extensively in the current code of the protocol already so this fix is easy. 

Severity: High

Impact Category: 

Permanent freezing of unclaimed yield

Permanent freezing of unclaimed royalties

        
## Proof of concept

#  Proof of Concept

Step 1: Setup the precondition for this vulnerability. 

  Step 1.1 : setup the scenario to have 1 token as reward token but does not return a boolean value. 

   Step 1.2 The rewards are sent into the flywheels contracts. 

Step 2: Position owner claimRewards 

The transaction will be reverted. 

POC code: 

The ERC20_MissingReturnToken 
```solidity 

contract ERC20_MissingReturnToken {
    // --- ERC20 Data ---
    string  public constant name = "Token";
    string  public constant symbol = "TKN";
    uint8   public constant decimals = 6;
    uint256 public totalSupply;

    mapping (address => uint)                      public balanceOf;
    mapping (address => mapping (address => uint)) public allowance;

    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);

    // --- Math ---
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x);
    }
    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x);
    }

    // --- Init ---
    constructor(uint _totalSupply) public {
        totalSupply = _totalSupply;
        balanceOf[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    // --- Token ---
    function transfer(address dst, uint wad) external {
        transferFrom(msg.sender, dst, wad);
    }
    function transferFrom(address src, address dst, uint wad) public {
        require(balanceOf[src] >= wad, "insufficient-balance");
        if (src != msg.sender && allowance[src][msg.sender] != type(uint).max) {
            require(allowance[src][msg.sender] >= wad, "insufficient-allowance");
            allowance[src][msg.sender] = sub(allowance[src][msg.sender], wad);
        }
        balanceOf[src] = sub(balanceOf[src], wad);
        balanceOf[dst] = add(balanceOf[dst], wad);
        emit Transfer(src, dst, wad);
    }
    function approve(address usr, uint wad) external {
        allowance[msg.sender][usr] = wad;
        emit Approval(msg.sender, usr, wad);
    }
}
```

Code to claimRewards

```solidity
contract ModeWethUSDTLeveredPositionTest_2 is LeveredPositionTest {
  address wethMarket = 0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2;
  address USDTMarket = 0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3;
  address wethWhale = 0x7380511493DD4c2f1dD75E9CCe5bD52C787D4B51;
  address USDTWhale = 0x082321F9939373b02Ad54ea214BF6e822531e679;
  address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD; 
  address Weth = 0x4200000000000000000000000000000000000006; 

  IonicFlywheel flywheel;
  FlywheelStaticRewards rewards;
  address rewardToken;
  address Comptroller_admin; 
  

 function setUp() public forkAtBlock(MODE_MAINNET,9222742) { // Jun 17 2024 15:31:07 PM (+07:00 UTC)
    vm.label(wethMarket,"wethMarket"); 
    vm.label(USDTMarket,"USDTMarket"); 
    vm.label(wethWhale,"wethWhale");
    vm.label(USDTWhale,"USDTWhale"); 
  }


  function afterForkSetUp() internal override {
    super.afterForkSetUp();

    uint256 depositAmount = 1e18;
  

    ICErc20[] memory cTokens = new ICErc20[](1);
    cTokens[0] = ICErc20(USDTMarket);

    uint256[] memory newBorrowCaps = new uint256[](1);
    newBorrowCaps[0] = 1e36;

    IonicComptroller comptroller = IonicComptroller(ICErc20(wethMarket).comptroller());
    Comptroller_admin = comptroller.admin(); 
    vm.prank(comptroller.admin());
    comptroller._setMarketBorrowCaps(cTokens, newBorrowCaps);

    _configurePair(wethMarket, USDTMarket);
    _fundMarketAndSelf(ICErc20(wethMarket), wethWhale);
    _fundMarketAndSelf(ICErc20(USDTMarket), USDTWhale);

    (position, maxLevRatio, minLevRatio) = _openLeveredPosition(address(this), depositAmount);

    ERC20_MissingReturnToken token = new ERC20_MissingReturnToken(1e18);

    rewardToken = address(token); // Token with missing return value
    setUpFlywheel(rewardToken, address(collateralMarket), IonicComptroller(position.pool()),  Comptroller_admin );
    // Make sure that the reward token of this contract is 0
    deal(rewardToken,address(this),0); 
  }

  function setUpFlywheel(
    address _rewardToken,
    address mkt,
    IonicComptroller comptroller,
    address admin
  ) public {
    flywheel = new IonicFlywheel();
    flywheel.initialize(
      ERC20(_rewardToken),
      FlywheelStaticRewards(address(0)),
      IFlywheelBooster(address(0)),
      address(this) // owner
    );

    rewards = new FlywheelStaticRewards(FuseFlywheelCore(address(flywheel)), address(this), Authority(address(0)));
    flywheel.setFlywheelRewards(rewards);

    flywheel.addStrategyForRewards(ERC20(mkt));

    // add flywheel as rewardsDistributor to call flywheelPreBorrowAction / flywheelPreSupplyAction
    vm.prank(admin);
    require(comptroller._addRewardsDistributor(address(flywheel)) == 0);

    // seed rewards to flywheel
    deal(_rewardToken, address(rewards), 1_000_000 * (10**ERC20(_rewardToken).decimals()));

    // Start reward distribution at 1 token per second
    rewards.setRewardsInfo(
      ERC20(mkt),
      FlywheelStaticRewards.RewardsInfo({
        rewardsPerSecond: uint224(789 * 10**ERC20(_rewardToken).decimals()),
        rewardsEndTimestamp: 0
      })
    );
  }

  // forge test --match-test testRewardsClaim --match-contract ModeWethUSDTLeveredPositionTest_2 -vvvvv | format > testRewardsClaim_240619_0900.log
  function testRewardsClaim() public  {
    
        
    vm.warp(block.timestamp + 60 * 60 * 24);
    vm.roll(block.number + 10000);
    

    uint256 rewardsBalanceBefore = IERC20Upgradeable(rewardToken).balanceOf(address(this));
    console.log("rewardsBalanceBefore: ", rewardsBalanceBefore);
    position.claimRewards();
    uint256 rewardsBalanceAfter = IERC20Upgradeable(rewardToken).balanceOf(address(this));
    console.log("rewardsBalanceAfter: ", rewardsBalanceAfter);
    assertGt(rewardsBalanceAfter - rewardsBalanceBefore, 0, "should have claimed some rewards");      
   
  }



} 
```

The test log: 

```
Ran 1 test for contracts/test/LeveredPositionTest.t.sol:ModeWethUSDTLeveredPositionTest_2
[FAIL. Reason: EvmError: Revert] testRewardsClaim() (gas: 430895)
Logs:
  max ratio: 1885965991344438626
  min ratio: 1001765749894769215
  rewardsBalanceBefore:  0


    │   ├─ [35412] IonicFlywheel::claimRewards(LeveredPosition: [0x09F5a1d95b7C107831e4D8946f390eC71d27984B])
    │   │   ├─ [32633] ERC20_MissingReturnToken::transferFrom(FlywheelStaticRewards: [0x3D7Ebc40AF7092E3F1C81F2e996cbA5Cae2090d7], LeveredPosition: [0x09F5a1d95b7C107831e4D8946f390eC71d27984B], 17087549725 [1.708e10])
    │   │   │   ├─ emit Transfer(from: FlywheelStaticRewards: [0x3D7Ebc40AF7092E3F1C81F2e996cbA5Cae2090d7], to: LeveredPosition: [0x09F5a1d95b7C107831e4D8946f390eC71d27984B], value: 17087549725 [1.708e10])
    │   │   │   └─ ← [Stop] 
    │   │   ├─ emit ClaimRewards(rewardToken: LeveredPosition: [0x09F5a1d95b7C107831e4D8946f390eC71d27984B], amount: 17087549725 [1.708e10])
    │   │   └─ ← [Stop] 
    │   ├─ [403] IonicFlywheel::rewardToken() [staticcall]
    │   │   └─ ← [Return] ERC20_MissingReturnToken: [0x212224D2F2d262cd093eE13240ca4873fcCBbA3C]
    │   ├─ [541] ERC20_MissingReturnToken::balanceOf(LeveredPosition: [0x09F5a1d95b7C107831e4D8946f390eC71d27984B]) [staticcall]
    │   │   └─ ← [Return] 17087549725 [1.708e10]
    │   ├─ [6392] ERC20_MissingReturnToken::transfer(ModeWethUSDTLeveredPositionTest_2: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], 17087549725 [1.708e10])
    │   │   ├─ emit Transfer(from: LeveredPosition: [0x09F5a1d95b7C107831e4D8946f390eC71d27984B], to: ModeWethUSDTLeveredPositionTest_2: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], value: 17087549725 [1.708e10])
    │   │   └─ ← [Stop] 
    │   └─ ← [Revert] EvmError: Revert
    └─ ← [Revert] EvmError: Revert

```


Full POC: 
https://gist.github.com/Perseverancesuccess2021/8e1ab6f2c45f5c54fb0dfce97eaf1a96

Get full test case and replace the file: contracts\contracts\test\LeveredPositionTest.t.sol 


Run command 

```
forge test --match-test testRewardsClaim --match-contract ModeWethUSDTLeveredPositionTest_2 -vvvvv  > testRewardsClaim_240619_0900.log
```

Full Log file: 

https://gist.github.com/Perseverancesuccess2021/8e1ab6f2c45f5c54fb0dfce97eaf1a96
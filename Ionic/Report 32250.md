
# Users are at risk of being sandwich attacked because convertAllTo lacks slippage control

Submitted on Sun Jun 16 2024 06:29:44 GMT-0400 (Atlantic Standard Time) by @p0wd3r for [IOP | Ionic](https://immunefi.com/bounty/ionic-iop/)

Report ID: #32250

Report type: Smart Contract

Target: https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol

Impacts:
- Direct theft of any user funds, whether at-rest or in-motion, other than unclaimed yield

## Description
## Brief/Intro
`convertAllTo ` lacks slippage control.

The user cannot set the expected amount of assets to be returned. To avoid sandwich attacks when swapping assets through the DEX, the user must set the expected amount themselves.

**Although the swap strategy is not within the audit scope, this does not affect the existence of the vulnerability in LeveredPosition which is in scope, as users cannot set the expected amount, and the swap strategy can never satisfy the "non-existent expectation" anyway.**

## Vulnerability Details
In `fundPosition`, if the user does not provide the `collateralAsset`, it will be swapped into `collateralAsset` through the strategy.

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L56-L65
```
  function fundPosition(IERC20Upgradeable fundingAsset, uint256 amount) public {
    fundingAsset.safeTransferFrom(msg.sender, address(this), amount);
    _supplyCollateral(fundingAsset);
https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L360-L365

  function _supplyCollateral(IERC20Upgradeable fundingAsset) internal returns (uint256 amountToSupply) {
    // in case the funding is with a different asset
    if (address(collateralAsset) != address(fundingAsset)) {
      // swap for collateral asset
      convertAllTo(fundingAsset, collateralAsset);
    }
```

The `fundPosition`s parameter only has the input amount, without the expected output amount, which means that if a swap occurs and the swap price does not meet the user's expectations, the user has no way to prevent it.

For example, suppose the user converts USDC to ETH. When initiating the transaction, the price of ETH is 3000 USDC, but when the transaction is executed, the price becomes 2700 USDC. Due to the lack of slippage control, the user has no choice but to accept this price, resulting in unnecessary asset loss.

The `closePosition` function also directly calls `convertAllTo`, and is similarly affected by this vulnerability.

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L85-L88
```solidity
    if (stableAsset.balanceOf(address(this)) > 0) {
      // convert all overborrowed leftovers/profits to the collateral asset
      convertAllTo(stableAsset, collateralAsset);
    }
```

When adjusting leverage, calling `convertAllTo` has a smaller impact because if the returned amount is too small, it will not be able to repay the flash loan.

## Impact Details
The user cannot set the expected amount of assets to be returned. To avoid sandwich attacks when swapping assets through the DEX, the user must set the expected amount themselves.

For example, suppose the user want to convert USDC to ETH through `fundPosition`. When initiating the transaction, the price of ETH is 3000 USDC, but when the transaction is executed, the price becomes 2700 USDC. Due to the lack of slippage control, the user has no choice but to accept this price, resulting in unnecessary asset loss.
## References
- https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L56-L65

        
## Proof of concept
## Proof of Concept

```
git diff contracts/test/LeveredPositionTest.t.sol
```

```
diff --git a/contracts/test/LeveredPositionTest.t.sol b/contracts/test/LeveredPositionTest.t.sol
index a168276..1f60b0e 100644
--- a/contracts/test/LeveredPositionTest.t.sol
+++ b/contracts/test/LeveredPositionTest.t.sol
@@ -1026,6 +1026,20 @@ contract ModeWethUSDTLeveredPositionTest is LeveredPositionTest {

     (position, maxLevRatio, minLevRatio) = _openLeveredPosition(address(this), depositAmount);
   }
+
+  function testDepositSlippage() public whenForking {
+    IERC20Upgradeable stableAsset = IERC20Upgradeable(stableMarket.underlying());
+
+    address depositor = makeAddr("depositor");
+    deal(address(stableAsset), depositor, 1e18);
+    vm.startPrank(depositor);
+    uint256 colBalanceBefore = collateralMarket.balanceOfUnderlying(address(position));
+    IERC20Upgradeable(stableAsset).approve(address(position), 1e18);
+    position.fundPosition(stableAsset, 1e18);
+    uint256 colBalanceAfter = collateralMarket.balanceOfUnderlying(address(position));
+    emit log_named_uint("col expected", 2e18); // user expect to receive 2e18, but cannot set as param in fundPosition
+    emit log_named_uint("col get", colBalanceAfter - colBalanceBefore);
+  }
 }

 contract ModeWbtcUSDCLeveredPositionTest is LeveredPositionTest 
```

```
forge test --mc 'ModeWethUSDTLeveredPositionTest' --mt 'testDepositSlippage' -vv

Ran 1 test for contracts/test/LeveredPositionTest.t.sol:ModeWethUSDTLeveredPositionTest
[PASS] testDepositSlippage() (gas: 1907593)
Logs:
  max ratio: 1885965991410559190
  min ratio: 1001765749713848836
  col expected: 2000000000000000000
  col get: 10474389203682705647

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 212.53s (85.91s CPU time)

Ran 1 test suite in 212.75s (212.53s CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
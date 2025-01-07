# Fluid Protocol

## Reports by Severity

<details>

<summary>Critical</summary>

* \#37671 \[SC-Critical] CRITICAL-02 / The contract could be permanently locked due to not reseting the boolen lock
* \#37323 \[SC-Critical] Permanent dead Lock in internal\_redeem\_collateral\_from\_trove
* \#37452 \[SC-Critical] \`trove-manager-contract.redeem\_collateral\_from\_trove\` can be locked forever
* \#37624 \[SC-Critical] Lock Issue Bricks The Redeem Functionality

</details>

<details>

<summary>Medium</summary>

* \#37276 \[SC-Medium] Redstone's price feed is used incorrectly.

</details>

<details>

<summary>Low</summary>

* \#37668 \[SC-Low] Incorrect Scale Factor value leads to early scale change
* \#37650 \[SC-Low] Redeem Functionality Partially Failing
* \#37354 \[SC-Low] Single below MCR trove temporarily blocks redemptions
* \#37283 \[SC-Low] Improper Trove Validation Check Allows Low-Cost Griefing Attack to Block Protocol Redemptions
* \#37192 \[SC-Low] Trove that under MCR might be redeemed.
* \#37409 \[SC-Low] Can not redeem when all \`current\_cr\` less than \`MCR\`.
* \#37607 \[SC-Low] Bricking Redeem Function

</details>

<details>

<summary>Insight</summary>

* \#36922 \[SC-Insight] the function claim\_collateral in borrowOperation have read only attribute while the invoked claim\_collateral function have write attribute, this lead to compiler-time error
* \#37139 \[SC-Insight] INSIGHT: Inefficient Use of Storage Reentrancy Locks
* \#37056 \[SC-Insight] \`require\_at\_least\_min\_net\_debt\` did not emit correct error message
* \#37202 \[SC-Insight] some checks can be removed since its not required(best practice report, not an issue)
* \#37343 \[SC-Insight] Inaccurate Check Leading to Debt Miscalculation
* \#37382 \[SC-Insight] Inconsistent Collateral Ratio Checks in Stability Pool Withdrawals Lead to Fund-Locking DoS
* \#37425 \[SC-Insight] redeem\_collateral does not redeem collateral from riskiest trove but wrongly redeem lowest healthy troves with lowest collateral Ratio
* \#37595 \[SC-Insight] \`require\_caller\_is\_bo\_or\_tm\_or\_sp\_or\_pm\` did not emit correct message

</details>

## Reports by Type

<details>

<summary>Smart Contract</summary>

* \#37668 \[SC-Low] Incorrect Scale Factor value leads to early scale change
* \#37650 \[SC-Low] Redeem Functionality Partially Failing
* \#37276 \[SC-Medium] Redstone's price feed is used incorrectly.
* \#36922 \[SC-Insight] the function claim\_collateral in borrowOperation have read only attribute while the invoked claim\_collateral function have write attribute, this lead to compiler-time error
* \#37139 \[SC-Insight] INSIGHT: Inefficient Use of Storage Reentrancy Locks
* \#37354 \[SC-Low] Single below MCR trove temporarily blocks redemptions
* \#37671 \[SC-Critical] CRITICAL-02 / The contract could be permanently locked due to not reseting the boolen lock
* \#37056 \[SC-Insight] \`require\_at\_least\_min\_net\_debt\` did not emit correct error message
* \#37202 \[SC-Insight] some checks can be removed since its not required(best practice report, not an issue)
* \#37283 \[SC-Low] Improper Trove Validation Check Allows Low-Cost Griefing Attack to Block Protocol Redemptions
* \#37323 \[SC-Critical] Permanent dead Lock in internal\_redeem\_collateral\_from\_trove
* \#37343 \[SC-Insight] Inaccurate Check Leading to Debt Miscalculation
* \#37382 \[SC-Insight] Inconsistent Collateral Ratio Checks in Stability Pool Withdrawals Lead to Fund-Locking DoS
* \#37192 \[SC-Low] Trove that under MCR might be redeemed.
* \#37425 \[SC-Insight] redeem\_collateral does not redeem collateral from riskiest trove but wrongly redeem lowest healthy troves with lowest collateral Ratio
* \#37409 \[SC-Low] Can not redeem when all \`current\_cr\` less than \`MCR\`.
* \#37452 \[SC-Critical] \`trove-manager-contract.redeem\_collateral\_from\_trove\` can be locked forever
* \#37595 \[SC-Insight] \`require\_caller\_is\_bo\_or\_tm\_or\_sp\_or\_pm\` did not emit correct message
* \#37607 \[SC-Low] Bricking Redeem Function
* \#37624 \[SC-Critical] Lock Issue Bricks The Redeem Functionality

</details>

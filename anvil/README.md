# Anvil

## Reports by Severity

<details>

<summary>Critical</summary>

* \#36554 \[SC-Critical] Time Based Collateral Pool Users can release more than their due share of the pool, drawing from the due share of other users

</details>

<details>

<summary>Medium</summary>

* \#36475 \[SC-Medium] Token allowance signature can be front-run
* \#36532 \[SC-Medium] Frontrun to invalidate collateralizable approval signature
* \#36552 \[SC-Medium] DoS for the user's calling \`stake\` and \`stakeReleasableTokensFrom\` function
* \#36567 \[SC-Medium] Anyone can cancel anyone's LOC
* \#36268 \[SC-Medium] stake with signature can be front-run lead to user's stake failed
* \#36303 \[SC-Medium] Attackers can cause griefing attack to cause stake transactions of TimeBasedCollateralPool of users to always revert by front-running the user transaction to make the provided si...
* \#36501 \[SC-Medium] Signature Front-Running Vulnerability in CollateralVault

</details>

<details>

<summary>Low</summary>

* \#36309 \[SC-Low] TimeBasedCollateralPool: After \_resetPool gets called (internally) a depositor can break most functionalities of the smart contract
* \#36450 \[SC-Low] Contract TimeBasedCollateralPool will be unable to process new user transactions and user funds are temporary frozen if a user unstake transaction of TimeBasedCollateralPool execute...

</details>

<details>

<summary>Insight</summary>

* \#36340 \[SC-Insight] TimeBasedCollateralPool::\_resetAccountTokenStateIfApplicable does not adjust tokenEpochExitBalances after redeeming the account's unstake Units
* \#36346 \[SC-Insight] Typehash Discrepancy in CollateralizableTokenAllowanceAdjustment
* \#36306 \[SC-Insight] Incorrect nonce value emitted in \`TimeBasedCollateralPool::\_resetPool\` event
* \#36540 \[SC-Insight] Users Can Withdraw Funds at Incorrect Fee Rate
* \#36092 \[SC-Insight] Collateralizable Contracts May Retain Status Unconditionally
* \#36136 \[SC-Insight] Fee calculation error in withdraw function of collateralVault contract
* \#36267 \[SC-Insight] Tokens can be stuck forever in UniswapLiquidator because function retrieveTokens always reverts for USDT and all tokens that have transfer function that do not return boolean

</details>

## Reports by Type

<details>

<summary>Smart Contract</summary>

* \#36309 \[SC-Low] TimeBasedCollateralPool: After \_resetPool gets called (internally) a depositor can break most functionalities of the smart contract
* \#36340 \[SC-Insight] TimeBasedCollateralPool::\_resetAccountTokenStateIfApplicable does not adjust tokenEpochExitBalances after redeeming the account's unstake Units
* \#36346 \[SC-Insight] Typehash Discrepancy in CollateralizableTokenAllowanceAdjustment
* \#36450 \[SC-Low] Contract TimeBasedCollateralPool will be unable to process new user transactions and user funds are temporary frozen if a user unstake transaction of TimeBasedCollateralPool execute...
* \#36475 \[SC-Medium] Token allowance signature can be front-run
* \#36306 \[SC-Insight] Incorrect nonce value emitted in \`TimeBasedCollateralPool::\_resetPool\` event
* \#36532 \[SC-Medium] Frontrun to invalidate collateralizable approval signature
* \#36552 \[SC-Medium] DoS for the user's calling \`stake\` and \`stakeReleasableTokensFrom\` function
* \#36554 \[SC-Critical] Time Based Collateral Pool Users can release more than their due share of the pool, drawing from the due share of other users
* \#36567 \[SC-Medium] Anyone can cancel anyone's LOC
* \#36540 \[SC-Insight] Users Can Withdraw Funds at Incorrect Fee Rate
* \#36092 \[SC-Insight] Collateralizable Contracts May Retain Status Unconditionally
* \#36136 \[SC-Insight] Fee calculation error in withdraw function of collateralVault contract
* \#36267 \[SC-Insight] Tokens can be stuck forever in UniswapLiquidator because function retrieveTokens always reverts for USDT and all tokens that have transfer function that do not return boolean
* \#36268 \[SC-Medium] stake with signature can be front-run lead to user's stake failed
* \#36303 \[SC-Medium] Attackers can cause griefing attack to cause stake transactions of TimeBasedCollateralPool of users to always revert by front-running the user transaction to make the provided si...
* \#36501 \[SC-Medium] Signature Front-Running Vulnerability in CollateralVault

</details>

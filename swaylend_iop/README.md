# Swaylend | IOP

## Reports by Severity

<details>

<summary>Critical</summary>

* \#35767 \[SC-Critical] constanct value is used to check \`price.confidence\`
* \#35758 \[SC-Critical] Loss of yield to the protocol due to incorrect interest rate applied
* \#35684 \[SC-Critical] Incorrect Pyth Oracle Price Feed Process Leads to Wrong Collateral Value Calculation

</details>

<details>

<summary>High</summary>

* \#35793 \[SC-High] \`src-20.burn\` should use "==" instead of ">="
* \#35876 \[SC-High] Users will lose funds on calls to critical functions if the prices are not updated
* \#35750 \[SC-High] User loss due to Pyth oracle update fee being smaller than the msg amount sent
* \#36117 \[SC-High] Permanent freezing of tokens when user sends extra tokens as update fee
* \#35831 \[SC-High] By bypassing base\_borrow\_min limitation borrows can create inabsorbable loans

</details>

<details>

<summary>Medium</summary>

* \#35815 \[SC-Medium] \`Market.present\_value\_borrow\` should be roundUp
* \#36137 \[SC-Medium] \`absorb\_internal\` might be DOSed
* \#36034 \[SC-Medium] truncation in the \`present\_value\_borrow()\` can lead to loss of accrued borrow interests.
* \#35853 \[SC-Medium] permissonless constructor always for front-running owner initialization.

</details>

<details>

<summary>Low</summary>

* \#35761 \[SC-Low] Unhandled smaller base decimals than 6 or bigger than the collateral's decimals
* \#35760 \[SC-Low] \`market::available\_to\_borrow()\` compares the collateral in USD against the borrow in base units
* \#35724 \[SC-Low] Users can withdraw collateral even when the admin pauses the contract.
* \#36158 \[SC-Low] \`Market.collateral\_value\_to\_sell\` will always revert if collateral\_configuration.decimals < storage.market\_configuration.base\_token\_decimals
* \#35908 \[SC-Low] If the collateral token''s decimal is <= the base token decimal in a market, \`collateral\_value\_to\_sell()\` will always revert & \`available\_to\_borrow()\` will return a wrong amount tha...
* \#35732 \[SC-Low] Withdrawals can not be paused which could lead to protocol insolvency in case of issues

</details>

<details>

<summary>Insight</summary>

* \#35708 \[SC-Insight] Adding too many collaterals will halt the protocol operation
* \#35999 \[SC-Insight] Incorrect event name
* \#35794 \[SC-Insight] \`Market.absorb\` can be called when \`Market.supply\_collateral\` is paused
* \#36065 \[SC-Insight] \`Market.update\_market\_configuration\` should reuse old configuration's \`base\_token.decimals\`
* \#36108 \[SC-Insight] \`recipient\` with a NULL address will lead to permanent loss of minted coins
* \#36138 \[SC-Insight] \`Market.update\_collateral\_asset\` should reuse old configuration's \`asset\_id\`
* \#35768 \[SC-Insight] \`Market.set\_pyth\_contract\_id\` should emit an event

</details>

## Reports by Type

<details>

<summary>Smart Contract</summary>

* \#35708 \[SC-Insight] Adding too many collaterals will halt the protocol operation
* \#35761 \[SC-Low] Unhandled smaller base decimals than 6 or bigger than the collateral's decimals
* \#35793 \[SC-High] \`src-20.burn\` should use "==" instead of ">="
* \#35876 \[SC-High] Users will lose funds on calls to critical functions if the prices are not updated
* \#35767 \[SC-Critical] constanct value is used to check \`price.confidence\`
* \#35750 \[SC-High] User loss due to Pyth oracle update fee being smaller than the msg amount sent
* \#35999 \[SC-Insight] Incorrect event name
* \#35794 \[SC-Insight] \`Market.absorb\` can be called when \`Market.supply\_collateral\` is paused
* \#35758 \[SC-Critical] Loss of yield to the protocol due to incorrect interest rate applied
* \#35760 \[SC-Low] \`market::available\_to\_borrow()\` compares the collateral in USD against the borrow in base units
* \#35815 \[SC-Medium] \`Market.present\_value\_borrow\` should be roundUp
* \#35724 \[SC-Low] Users can withdraw collateral even when the admin pauses the contract.
* \#36065 \[SC-Insight] \`Market.update\_market\_configuration\` should reuse old configuration's \`base\_token.decimals\`
* \#36108 \[SC-Insight] \`recipient\` with a NULL address will lead to permanent loss of minted coins
* \#36117 \[SC-High] Permanent freezing of tokens when user sends extra tokens as update fee
* \#36137 \[SC-Medium] \`absorb\_internal\` might be DOSed
* \#36138 \[SC-Insight] \`Market.update\_collateral\_asset\` should reuse old configuration's \`asset\_id\`
* \#36158 \[SC-Low] \`Market.collateral\_value\_to\_sell\` will always revert if collateral\_configuration.decimals < storage.market\_configuration.base\_token\_decimals
* \#35831 \[SC-High] By bypassing base\_borrow\_min limitation borrows can create inabsorbable loans
* \#35684 \[SC-Critical] Incorrect Pyth Oracle Price Feed Process Leads to Wrong Collateral Value Calculation
* \#35768 \[SC-Insight] \`Market.set\_pyth\_contract\_id\` should emit an event
* \#35908 \[SC-Low] If the collateral token''s decimal is <= the base token decimal in a market, \`collateral\_value\_to\_sell()\` will always revert & \`available\_to\_borrow()\` will return a wrong amount tha...
* \#35732 \[SC-Low] Withdrawals can not be paused which could lead to protocol insolvency in case of issues
* \#36034 \[SC-Medium] truncation in the \`present\_value\_borrow()\` can lead to loss of accrued borrow interests.
* \#35853 \[SC-Medium] permissonless constructor always for front-running owner initialization.

</details>

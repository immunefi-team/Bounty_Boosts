# Lombard

## Reports by Severity

<details>

<summary>Medium</summary>

* \#38634 \[SC-Medium] Insufficient validation on offchainTokenData in TokenPool.releaseOrMint allows CCIP message to be executed with mismatched payload potentially leading to loss of funds in cross-ch...
* \#38066 \[SC-Medium] \`ProxyFactory\` is vulnerable to DoS/Address Hijacking
* \#38154 \[SC-Medium] The offchain data provided to the CLAdapter isn’t properly validated and can be from a different CCIP message, resulting in the freezing of funds
* \#38342 \[SC-Medium] Interchanging \`offchainTokenData\` between two valid messages
* \#38363 \[SC-Medium] LBTC cross-chain transfer can be DOSed
* \#38335 \[SC-Medium] Attacker can exploit PartnerVault mint small amount to cause LBTC depeg or Protocol Insolvency

</details>

<details>

<summary>Low</summary>

* \#38344 \[SC-Low] Old validated messages can not pass proof check when new validators are set
* \#38137 \[SC-Low] \`RateLimits\` library incorrectly reset the consumed amount when the limit is updated
* \#38231 \[SC-Low] Due to incorrect design in \`Consortium::setNextValidatorSet\` the validator set could not be set in certain valid scenarios
* \#38286 \[SC-Low] BitcoinUtils.getDustLimitForOutput calculate wrongly the dust limit for a given Bitcoin script public key

</details>

<details>

<summary>Insight</summary>

* \#38644 \[SC-Insight] Q\&A
* \#38102 \[SC-Insight] Due to incorrect design in \`BasculeV2::validateWithdrawal\` valid transactions will be reverted, which will make protocol unable to mint tokens
* \#38012 \[SC-Insight] Unused Function in CLAdapter Contract
* \#38116 \[SC-Insight] Partner vaults don't account for FireBridge fees, forcing LBTC burn to never work
* \#38148 \[SC-Insight] Unnecessary Storage Pointer Declaration batchMintWithFee
* \#38189 \[SC-Insight] Attacker can grief calls to \`lbtc.mintWithFee()\`
* \#38225 \[SC-Insight] user funds will get stuck if \`removeDestination\` executes before notarization and withdraw.
* \#38257 \[SC-Insight] Freezing of msg.value passed in Bridge.deposit() if adapter is address zero
* \#38341 \[SC-Insight] Suboptimal gas usage and ambiguous behavior during fee estimation
* \#38370 \[SC-Insight] Issue Between Comment and Code in Consortium

</details>

## Reports by Type

<details>

<summary>Smart Contract</summary>

* \#38644 \[SC-Insight] Q\&A
* \#38344 \[SC-Low] Old validated messages can not pass proof check when new validators are set
* \#38137 \[SC-Low] \`RateLimits\` library incorrectly reset the consumed amount when the limit is updated
* \#38102 \[SC-Insight] Due to incorrect design in \`BasculeV2::validateWithdrawal\` valid transactions will be reverted, which will make protocol unable to mint tokens
* \#38634 \[SC-Medium] Insufficient validation on offchainTokenData in TokenPool.releaseOrMint allows CCIP message to be executed with mismatched payload potentially leading to loss of funds in cross-ch...
* \#38012 \[SC-Insight] Unused Function in CLAdapter Contract
* \#38066 \[SC-Medium] \`ProxyFactory\` is vulnerable to DoS/Address Hijacking
* \#38116 \[SC-Insight] Partner vaults don't account for FireBridge fees, forcing LBTC burn to never work
* \#38148 \[SC-Insight] Unnecessary Storage Pointer Declaration batchMintWithFee
* \#38154 \[SC-Medium] The offchain data provided to the CLAdapter isn’t properly validated and can be from a different CCIP message, resulting in the freezing of funds
* \#38189 \[SC-Insight] Attacker can grief calls to \`lbtc.mintWithFee()\`
* \#38225 \[SC-Insight] user funds will get stuck if \`removeDestination\` executes before notarization and withdraw.
* \#38257 \[SC-Insight] Freezing of msg.value passed in Bridge.deposit() if adapter is address zero
* \#38231 \[SC-Low] Due to incorrect design in \`Consortium::setNextValidatorSet\` the validator set could not be set in certain valid scenarios
* \#38286 \[SC-Low] BitcoinUtils.getDustLimitForOutput calculate wrongly the dust limit for a given Bitcoin script public key
* \#38341 \[SC-Insight] Suboptimal gas usage and ambiguous behavior during fee estimation
* \#38342 \[SC-Medium] Interchanging \`offchainTokenData\` between two valid messages
* \#38363 \[SC-Medium] LBTC cross-chain transfer can be DOSed
* \#38370 \[SC-Insight] Issue Between Comment and Code in Consortium
* \#38335 \[SC-Medium] Attacker can exploit PartnerVault mint small amount to cause LBTC depeg or Protocol Insolvency

</details>

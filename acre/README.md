# Acre

## Reports by Severity

<details>

<summary>Medium</summary>

* \#34836 \[SC-Medium] Malicious party can make it impossible for debt to be completely repaid by donating a few tbtc to \`stBTC.sol\`
* \#34712 \[SC-Medium] Malicious users can block repay debt transactions with no cost

</details>

<details>

<summary>Low</summary>

* \#34851 \[SC-Low] Adversary can freeze users' fund in stBTC using donation attack on MezoAllocator
* \#34729 \[SC-Low] \`releaseDeposit\` will likely fail, putting funds in MezoAllocator at risk of being permanently stuck
* \#34748 \[SC-Low] Last withdrawer can be prevented from withdrawing their assets
* \#34999 \[SC-Low] The tBTC in the MezoAllocator itself is not considered in the withdrawal function
* \#34672 \[SC-Low] Protocol runs insolvent due to incorrect reliance on depositBalance which doesn't match holder balances
* \#34995 \[SC-Low] \`mintDebt()\` and \`repayDebt()\` should return \`assets\` and not \`shares\`
* \#35026 \[SC-Low] \`repayDebt\` in stbtc returns a worng value
* \#35014 \[SC-Low] Incorrect rounding in mintDebt function might allow minimal shares dilution
* \#34978 \[SC-Low] Protocol runs insolvent due to incorrect reliance on depositBalance which doesn't match holder balances
* \#34959 \[SC-Low] \`mintDebt\` returns a wrong value

</details>

<details>

<summary>Insight</summary>

* \#34998 \[SC-Insight] Deposited assets in an old dispatcher may be lost when swapping to a new dispatcher

</details>

## Reports by Type

<details>

<summary>Smart Contract</summary>

* \#34836 \[SC-Medium] Malicious party can make it impossible for debt to be completely repaid by donating a few tbtc to \`stBTC.sol\`
* \#34851 \[SC-Low] Adversary can freeze users' fund in stBTC using donation attack on MezoAllocator
* \#34729 \[SC-Low] \`releaseDeposit\` will likely fail, putting funds in MezoAllocator at risk of being permanently stuck
* \#34748 \[SC-Low] Last withdrawer can be prevented from withdrawing their assets
* \#34999 \[SC-Low] The tBTC in the MezoAllocator itself is not considered in the withdrawal function
* \#34672 \[SC-Low] Protocol runs insolvent due to incorrect reliance on depositBalance which doesn't match holder balances
* \#34998 \[SC-Insight] Deposited assets in an old dispatcher may be lost when swapping to a new dispatcher
* \#34712 \[SC-Medium] Malicious users can block repay debt transactions with no cost
* \#34995 \[SC-Low] \`mintDebt()\` and \`repayDebt()\` should return \`assets\` and not \`shares\`
* \#35026 \[SC-Low] \`repayDebt\` in stbtc returns a worng value
* \#35014 \[SC-Low] Incorrect rounding in mintDebt function might allow minimal shares dilution
* \#34978 \[SC-Low] Protocol runs insolvent due to incorrect reliance on depositBalance which doesn't match holder balances
* \#34959 \[SC-Low] \`mintDebt\` returns a wrong value

</details>

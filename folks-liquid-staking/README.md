# Folks: Liquid Staking

## Reports by Severity

<details>

<summary>High</summary>

* \#37660 \[SC-High] incorrect tracking of \`TOTAL\_ACTIVE\_STAKE\` leads to permanent freezing of funds
* \#37775 \[SC-High] Accounting Discrepancy in \`consensus\_v2.py::burn()\`can potentially cause underflow and lead to temporary Denial of Service and a deliberate DOS Attack
* \#37852 \[SC-High] The accumulation of rewards is being decreased from the active stake which could leave out users unable to redeem xAlgo
* \#37863 \[SC-High] Underflow in burn method prevents all xALGO from being burnt
* \#37889 \[SC-High] Underflow in \`burn()\` function will cause user funds to partially frozen
* \#37940 \[SC-High] Freezing of user funds When Reward accumulated or added
* \#37903 \[SC-High] "Potential Underflow Vulnerability in burn Function for total\_active\_stake\_key"
* \#37661 \[SC-High] Incorrect \`total\_active\_stake\` reduction causes loss of funds for the users and excessive fees collection over time

</details>

<details>

<summary>Low</summary>

* \#37867 \[SC-Low] Contract upgrade failing due to SHA256 failing because of AVM byte width limits

</details>

<details>

<summary>Insight</summary>

* \#37768 \[SC-Insight] Missing Event Emission when proposer are added prevents safe retrieval of index for subsequent operations
* \#37807 \[SC-Insight] Truncation of mint\_amount to zero leading to potential stake loss
* \#37854 \[SC-Insight] Missing state validation upon Upgrade
* \#37893 \[SC-Insight] Inflation Attack in xAlgo
* \#37864 \[SC-Insight] Over-charging users on delayed mint
* \#37791 \[SC-Insight] Consensus contract distributes Algo for proposers that are offline that cause losing of reward

</details>

## Reports by Type

<details>

<summary>Smart Contract</summary>

* \#37660 \[SC-High] incorrect tracking of \`TOTAL\_ACTIVE\_STAKE\` leads to permanent freezing of funds
* \#37768 \[SC-Insight] Missing Event Emission when proposer are added prevents safe retrieval of index for subsequent operations
* \#37775 \[SC-High] Accounting Discrepancy in \`consensus\_v2.py::burn()\`can potentially cause underflow and lead to temporary Denial of Service and a deliberate DOS Attack
* \#37807 \[SC-Insight] Truncation of mint\_amount to zero leading to potential stake loss
* \#37852 \[SC-High] The accumulation of rewards is being decreased from the active stake which could leave out users unable to redeem xAlgo
* \#37854 \[SC-Insight] Missing state validation upon Upgrade
* \#37863 \[SC-High] Underflow in burn method prevents all xALGO from being burnt
* \#37889 \[SC-High] Underflow in \`burn()\` function will cause user funds to partially frozen
* \#37893 \[SC-Insight] Inflation Attack in xAlgo
* \#37940 \[SC-High] Freezing of user funds When Reward accumulated or added
* \#37867 \[SC-Low] Contract upgrade failing due to SHA256 failing because of AVM byte width limits
* \#37903 \[SC-High] "Potential Underflow Vulnerability in burn Function for total\_active\_stake\_key"
* \#37864 \[SC-Insight] Over-charging users on delayed mint
* \#37661 \[SC-High] Incorrect \`total\_active\_stake\` reduction causes loss of funds for the users and excessive fees collection over time
* \#37791 \[SC-Insight] Consensus contract distributes Algo for proposers that are offline that cause losing of reward

</details>

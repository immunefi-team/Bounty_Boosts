# Shardeum Core II

## Reports by Severity

<details>

<summary>Critical</summary>

* \#35526 \[BC-Critical] An attacker can change the account balance after the transaction has been processed.
* \#35839 \[BC-Critical] Slash avoidance: Ineffective controls on unstaking allow unstaking before taking an action that should be slashed
* \#35707 \[BC-Critical] Reusing old transaction receipt to rollback account balance
* \#35531 \[BC-Critical] Absence of signature deduplication for receipt in the binary\_repair\_oos\_accounts P2P handler
* \#35695 \[BC-Critical] validateTxnFields check for internal transactions can be bypassed
* \#35601 \[BC-Critical] Consensus algorithm doesn't deduplicate votes, allowing a malicious validator to completely falsify transactions
* \#35694 \[BC-Critical] Consensus can be bypassed by single validator node from transaction execution group
* \#35696 \[BC-Critical] Specifically crafted penalty TX may cause total network shutdown.

</details>

<details>

<summary>Insight</summary>

* \#35710 \[BC-Insight] addressToPartition input is unsanitized, allowing to take whole network down
* \#35697 \[BC-Insight] \[Informational] Code logic contains potential risk of full network shutdown
* \#35641 \[BC-Insight] node p2p remote denial of service
* \#35415 \[BC-Insight] \[Informational] debugMiddleware query parameters can be partially modified by request submitter or via MITM
* \#35965 \[BC-Insight] Unverified Data in Safety Sync
* \#36024 \[BC-Insight] Use of Vulnerable function results in prediction of archivers
* \#36029 \[BC-Insight] Node.js crash on counterMap overflow

</details>

## Reports by Type

<details>

<summary>Blockchain/DLT</summary>

* \#35710 \[BC-Insight] addressToPartition input is unsanitized, allowing to take whole network down
* \#35697 \[BC-Insight] \[Informational] Code logic contains potential risk of full network shutdown
* \#35641 \[BC-Insight] node p2p remote denial of service
* \#35526 \[BC-Critical] An attacker can change the account balance after the transaction has been processed.
* \#35415 \[BC-Insight] \[Informational] debugMiddleware query parameters can be partially modified by request submitter or via MITM
* \#35839 \[BC-Critical] Slash avoidance: Ineffective controls on unstaking allow unstaking before taking an action that should be slashed
* \#35707 \[BC-Critical] Reusing old transaction receipt to rollback account balance
* \#35965 \[BC-Insight] Unverified Data in Safety Sync
* \#36024 \[BC-Insight] Use of Vulnerable function results in prediction of archivers
* \#35531 \[BC-Critical] Absence of signature deduplication for receipt in the binary\_repair\_oos\_accounts P2P handler
* \#35695 \[BC-Critical] validateTxnFields check for internal transactions can be bypassed
* \#35601 \[BC-Critical] Consensus algorithm doesn't deduplicate votes, allowing a malicious validator to completely falsify transactions
* \#35694 \[BC-Critical] Consensus can be bypassed by single validator node from transaction execution group
* \#36029 \[BC-Insight] Node.js crash on counterMap overflow
* \#35696 \[BC-Critical] Specifically crafted penalty TX may cause total network shutdown.

</details>

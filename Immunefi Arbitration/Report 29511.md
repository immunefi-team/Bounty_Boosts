
# Delegatecall Return Values in RewardSystem Contract Lead to Griefing

Submitted  about 1 month  ago by @ethworker (Whitehat)  for  [Boost | Immunefi Arbitration]

----------

Report ID: #29511

Report type: Smart Contract

Has PoC?: Yes

Target: https://github.com/immunefi-team/vaults/blob/main/src/oracles/PriceConsumer.sol

Impacts

-   Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)

## Details

Description: The RewardSystem.sol contract uses the  `delegatecall`  function to execute the  `sendReward`  and  `sendRewardNoFees`  functions in the  `vaultDelegate`  contract. However, the contract does not check the return values of these calls, which can lead to unexpected behavior and potential vulnerabilities if the called functions revert or return an unexpected value.

Affected Contract: RewardSystem ([GitHub link to the affected contract]([https://github.com/immunefi-team/vaults/blob/main/contracts/RewardSystem.sol](https://github.com/immunefi-team/vaults/blob/main/contracts/RewardSystem.sol)))

Affected Functions:

-   `enforceSendReward`
-   `enforceSendRewardNoFees`

Potential Exploit: If the  `vaultDelegate`  contract's  `sendReward`  or  `sendRewardNoFees`  functions revert for any reason (e.g., due to an error in the  `vaultDelegate`  contract, or if the  `vaultDelegate`  contract is malicious), the  `RewardSystem`  contract will not be aware of this. It will continue execution as if the call was successful, potentially leading to incorrect state updates or other unintended consequences.


## Proof of Concept (POC):

1.  Deploy a malicious  `vaultDelegate`  contract with a  `sendReward`  function that reverts.
2.  Call the  `enforceSendReward`  function in the  `RewardSystem`  contract, passing the malicious  `vaultDelegate`  contract's address and the required parameters.
3.  Observe that the transaction does not revert, and the  `RewardSystem`  contract continues execution as if the  `sendReward`  call was successful, even though it reverted.

Mitigation: To mitigate this vulnerability, implement checks for the success of  `delegatecall`  operations using Solidity's  `try-catch`  statement. This allows for error handling in external calls, enabling the contract to take appropriate action, such as reverting the transaction or logging an error.

Example Fix:

```solidity
function enforceSendReward(
    uint96 referenceId,
    address to,
    Rewards.ERC20Reward[] calldata tokenAmounts,
    uint256 nativeTokenAmount,
    address vault,
    uint256 gasToTarget
) external onlyRole(ENFORCER_ROLE) {
    require(to != address(0), "RewardSystem: to cannot be 0x00");
    require(arbitration.vaultIsInArbitration(vault), "RewardSystem: vault is not in arbitration");

    bytes memory data = abi.encodeCall(
        vaultDelegate.sendReward,
        (referenceId, to, tokenAmounts, nativeTokenAmount, gasToTarget)
    );

    // Using try-catch to handle errors from delegatecall
    try immunefiModule.execute(vault, address(vaultDelegate), 0, data, Enum.Operation.DelegateCall) {
        // Handle successful execution
    } catch {
        // Handle error, e.g., revert or log an error message
        revert("RewardSystem: delegatecall to vaultDelegate failed");
    }
}

```

By implementing error handling, the contract can ensure that it responds appropriately to failures in the  `delegatecall`, reducing the risk of unexpected behavior and potential vulnerabilities.

Recommendations:

1.  Add error handling with  `try-catch`  statements for  `delegatecall`  operations in the  `enforceSendReward`  and  `enforceSendRewardNoFees`  functions.
2.  Review other instances of  `delegatecall`  in the contract and ensure that proper error handling is implemented.
3.  Consider using the  `staticcall`  function instead of  `delegatecall`  if the called function does not modify the state of the contract, as  `staticcall`  reverts the transaction if the called function reverts.

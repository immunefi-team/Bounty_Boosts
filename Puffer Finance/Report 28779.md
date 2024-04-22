# Missing sender address check in receive() may lead to locked Ether
Submitted about 2 months ago by @djxploit (Whitehat) for Boost | Puffer Finance

Report ID: #28779
Report type: Smart Contract
Has PoC? Yes
Target: https://etherscan.io/address/0xd9a442856c234a39a81a089c06451ebaa4306a72

# Impacts
- Permanent freezing of funds

# Details
Description

# Brief/Intro
The `receive` function of `PufferVault.sol` contract, is meant to `receive` Ether only from Lido. Hence any other ether sent to the contract (accidentally) will be forever locked in the contract, as it will not be accounted for.

# Vulnerability Details
Add an address check in `receive()` of `PufferVault.sol` to ensure the only address sending ETH being received in `receive()` is the Lido contract.

This will prevent stray Ether from being sent accidentally to this contract and getting locked.

# Impact Details
Ethers will get permanently locked in the PufferVault contract, if they are sent from addresses other than Lido contract. Furthermore it will also affect the accounting of the `totalAssets` functions, as it depends on the ether balance of the contract.

# References
https://etherscan.io/address/0xd9a442856c234a39a81a089c06451ebaa4306a72?utm_source=immunefi

# Proof of concept

Proof of Concept
Receive function of PufferVault contract

```
    receive() external payable virtual {
        VaultStorage storage $ = _getPufferVaultStorage();
        if ($.isLidoWithdrawal) {
            $.lidoLockedETH -= msg.value;
        }
    }
```

We can fix it by adding an address check like

```
    receive() external payable virtual {
        VaultStorage storage $ = _getPufferVaultStorage();
        require($.isLidoWithdrawal, "Not allowed");
        $.lidoLockedETH -= msg.value;
    }
```

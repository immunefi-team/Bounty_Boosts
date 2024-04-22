# Info
Submitted about 2 months ago by @OxJoyBoy03 (Whitehat) for Boost | Puffer Finance

Report ID: #28947
Report type: Smart Contract
Has PoC? Yes
Target: https://etherscan.io/address/0x7276925e42f9c4054afa2fad80fa79520c453d6a

# Impacts
- Info

# Details
Description
NC Issues
[N-1] errors and events did not use!!!

# Details
these errors and events were not used anywhere, you can remove or use them.

- Found in src/IPufferDepositor.sol [Line: 17](src/interface/IPufferDepositor.sol#L17)
```
//@audit-info This error is not used!!! 
error TokenNotAllowed(address token);
```

- Found in src/IPufferDepositor.sol [Line: 28](src/interface/IPufferDepositor.sol#L28)

```
//@audit-info this event is not used!!!
event TokenAllowed(IERC20 token);
```

- Found in src/IPufferDepositor.sol [Line: 33](src/interface/IPufferDepositor.sol#L33)

```
//@audit-info this event is not used!!!
event TokenDisallowed(IERC20 token);
```

# Proof of concept
Proof of Concept


# `VotingEscrow::updateUnlockTime()` - It's possible for voters to update their vote tokens unlock time as many times as they wish beyond the 365 day MAX limit, violating protocol invariant.

Submitted on Fri May 17 2024 14:19:03 GMT-0400 (Atlantic Standard Time) by @OxSCSamurai for [Boost | Alchemix](https://immunefi.com/bounty/alchemix-boost/)

Report ID: #31382

Report type: Smart Contract

Report severity: High

Target: https://github.com/alchemix-finance/alchemix-v2-dao/blob/main/src/VotingEscrow.sol

Impacts:
- Manipulation of governance voting result deviating from voted outcome and resulting in a direct change from intended effect of original results

## Description
## Brief/Intro

`VotingEscrow::updateUnlockTime()` - It's possible for voters to update their vote tokens unlock time as many times as they wish beyond the 365 day MAX limit, violating protocol invariant.

- it's made clear throughout the codebase and protocol docs that the maximum lock period for the NFT tokens is 1 year, i.e. 365 days, however, the bug in the `updateUnlockTime()` function makes it possible to repeatedly call this function(in different `block.timestamp` timestamps) to extend the unlock period almost indefinitely(e.g. extend by `MAXTIME` each time), but at least for almost 2 years it seems, as can be seen from the added `hevm.warp()` lines in the test function further down below.

## Vulnerability Details

The buggy function:
```solidity
    /**
     * @notice Extend the unlock time for `_tokenId`
     * @param _lockDuration New number of seconds until tokens unlock
     * @param _maxLockEnabled Is max lock being enabled
     */
    function updateUnlockTime(uint256 _tokenId, uint256 _lockDuration, bool _maxLockEnabled) external nonreentrant {
        require(_isApprovedOrOwner(msg.sender, _tokenId), "not approved or owner");

        LockedBalance memory _locked = locked[_tokenId];

        // If max lock is enabled set to max time
        // If max lock is being disabled start decay from max time
        // If max lock is disabled and not being enabled, add unlock time to current end
        uint256 unlockTime = _maxLockEnabled ? ((block.timestamp + MAXTIME) / WEEK) * WEEK : _locked.maxLockEnabled
            ? ((block.timestamp + MAXTIME) / WEEK) * WEEK
            : ((block.timestamp + _lockDuration) / WEEK) * WEEK;

        // If max lock is not enabled, require that the lock is not expired
        if (!_locked.maxLockEnabled) require(_locked.end > block.timestamp, "Lock expired");
        require(_locked.amount > 0, "Nothing is locked");
        require(unlockTime >= _locked.end, "Can only increase lock duration");
        require(unlockTime <= block.timestamp + MAXTIME, "Voting lock can be 1 year max");
        // Cannot update token that is in cooldown
        require(_locked.cooldown == 0, "Cannot increase lock duration on token that started cooldown");

        _depositFor(_tokenId, 0, unlockTime, _maxLockEnabled, _locked, DepositType.INCREASE_UNLOCK_TIME);
    }
```

## Impact Details

Impact: High
Likelihood: Medium
Severity: High

- a potential vote outcome manipulation impact
- if this is indeed a bug and not just my imagination, then I've demonstrated this bug with my first PoC below
- if you confirm that this bug is valid, I will aim to setup a PoC to demonstrate governance vote manipulation impact, which I already tried to do with my second set of PoC tests, and hopefully succeeded, but not 100% sure, please confirm?

## References

https://github.com/alchemix-finance/alchemix-v2-dao/blob/9e14da88d8db05794623d8ab5f449451a10c15ac/src/VotingEscrow.sol#L709-L735

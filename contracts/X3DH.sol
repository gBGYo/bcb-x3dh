// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

// Bob's bundle.
contract X3DH {
    uint256 constant NUMBER_OF_OPK = 128;

    struct Bundle {
        string IKb; // Bob's identity key
        string SPKb; // Bob's signed prekey
        string Sig; // Bob's prekey signature
        string[NUMBER_OF_OPK] OPKb; // Bob's one-time prekeys
        uint64 index; // Index into OPKb
    }

    address public owner;
    Bundle public bundle;

    constructor(
        string memory _IKb,
        string memory _SPKb,
        string memory _Sig,
        string[NUMBER_OF_OPK] memory _OPKb
    ) {
        owner = msg.sender;
        bundle.IKb = _IKb;
        bundle.SPKb = _SPKb;
        bundle.Sig = _Sig;
        bundle.OPKb = _OPKb;
        bundle.index = 0;
    }

    event BundleRequest(string, string, string, string);

    // requestBundle returns Bob's bundle.
    function requestBundle()
        external
        returns (string memory, string memory, string memory, string memory)
    {
        if (bundle.index >= NUMBER_OF_OPK) {
            emit BundleRequest(bundle.IKb, bundle.SPKb, bundle.Sig, "0");
            return (bundle.IKb, bundle.SPKb, bundle.Sig, "0");
        } else {
            emit BundleRequest(
                bundle.IKb,
                bundle.SPKb,
                bundle.Sig,
                bundle.OPKb[bundle.index]
            );
            return (
                bundle.IKb,
                bundle.SPKb,
                bundle.Sig,
                bundle.OPKb[bundle.index++]
            );
        }
    }
}

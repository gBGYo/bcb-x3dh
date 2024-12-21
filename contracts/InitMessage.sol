// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

interface Bundle {
    function requestBundle()
        external
        returns (string memory, string memory, string memory, string memory);
}

// Alices initial message.
contract InitMessage {
    struct Message {
        string IKa; // Alice's identity key
        string EKa; // Alice's ephemeral key
    }

    address public owner;
    Message public message;
    Bundle public bundle;

    constructor(string memory _IKa, string memory _EKa, address _bob) {
        owner = msg.sender;
        message.IKa = _IKa;
        message.EKa = _EKa;
        bundle = Bundle(_bob);
    }

    event BundleRequest(string, string, string, string);

    // getBundle returns Bob's bundle.
    function getBundle()
        external
        returns (string memory, string memory, string memory, string memory)
    {
        string memory IKb;
        string memory SPKb;
        string memory Sig;
        string memory OPKb;
        (IKb, SPKb, Sig, OPKb) = bundle.requestBundle();
        emit BundleRequest(IKb, SPKb, Sig, OPKb);
        return (IKb, SPKb, Sig, OPKb);
    }

    // requestBundle returns Alice's bundle.
    function requestBundle()
        external
        view
        returns (string memory, string memory)
    {
        return (message.IKa, message.EKa);
    }
}

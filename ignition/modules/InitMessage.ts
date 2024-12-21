import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import { generateAliceBundle } from '../../src/x3dh';
import { ethers } from "hardhat";

const InitMessageModule = buildModule("InitMessage", (m) => {
    let [priv_alice, pub_alice] = generateAliceBundle();
    let bob_address = ethers.getAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    const alice = m.contract("InitMessage", [...pub_alice, bob_address]);

    console.log("Deployed:");
    console.log("IK:", '0x' + pub_alice[0]);
    console.log("EK:", '0x' + pub_alice[1]);
    console.log("Bob address:", bob_address);

    return { alice }
});
export default InitMessageModule;
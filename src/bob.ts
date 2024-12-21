import hre from "hardhat";
import { generateBobBundle, calculateBobSecret } from '../src/x3dh';
import { x25519, ed25519 } from '@noble/curves/ed25519';
import { edwardsToMontgomeryPriv, edwardsToMontgomeryPub } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { hkdf } from '@noble/hashes/hkdf';
import { InitMessage, X3DH } from "../typechain-types";
import { EventLog, Result } from "ethers";
import chalk from 'chalk';


export async function deploy(): Promise<[string, [string, string, string[]]]> {
    const [bob, otherAccounts] = await hre.ethers.getSigners();

    // Deploying Bob's bundle on blockchain.
    const X3DHFactory = await hre.ethers.getContractFactory("X3DH");
    const [priv_bob, pub_bob] = generateBobBundle();
    const x3dh = await X3DHFactory.connect(bob).deploy(...pub_bob);
    await x3dh.waitForDeployment();
    const contractAddress = await x3dh.getAddress();

    console.log("Bob (%s) deployed his bundle at %s",
        chalk.blue(bob.address),
        chalk.green(contractAddress));

    return [contractAddress, priv_bob];
}

export async function calcSecret(initMessage: InitMessage, priv_bob: [string, string, string])
    : Promise<string> {
    // Getting Alice's bundle
    const [IKa, EKa] = await initMessage.requestBundle();

    // console.log("Bob got Alice's bundle from contract at %s:", await initMessage.getAddress());
    // console.log("\t", "0x" + IKa);
    // console.log("\t", "0x" + EKa);

    const SK = calculateBobSecret(
        IKa,
        EKa,
        priv_bob[0],
        priv_bob[1],
        priv_bob[2]
    );

    // console.log("Shared secret:", "0x" + SK);

    return SK;
}
import hre from "hardhat";
import { calculateAliceSecret, generateAliceBundle } from '../src/x3dh';
import { ed25519 } from '@noble/curves/ed25519';
import { EventLog, Result } from "ethers";
import { InitMessage } from "../typechain-types";
import chalk from 'chalk';


export async function deploy(x3dhAddress: string): Promise<[string, [string, string]]> {
    const [bob, alice, otherAccounts] = await hre.ethers.getSigners();

    // Deploying Alice's bundle on blockchain.
    const InitMessageFactory = await hre.ethers.getContractFactory("InitMessage");

    const [priv_alice, pub_alice] = generateAliceBundle();

    const initMessage = await InitMessageFactory
        .connect(alice)
        .deploy(...pub_alice, x3dhAddress);
    await initMessage.waitForDeployment();
    const contractAddress = await initMessage.getAddress();

    console.log("Alice (%s) deployed her bundle at %s",
        chalk.blue(alice.address),
        chalk.green(contractAddress));

    return [contractAddress, priv_alice];
}

export async function calcSecret(initMessage: InitMessage, priv_alice: [string, string])
    : Promise<string> {
    // Getting Bob's bundle
    const tx = await initMessage.getBundle();
    const result = await tx.wait();
    const [IKb, SPKb, Sigb, OPKb]: Result = (result?.logs[0] as EventLog).args;
    //console.log("Alice got OPKb:", OPKb);

    // Assert that Bob's prekey is actually belongs to Bob
    if (ed25519.verify(Sigb, SPKb, IKb) !== true) {
        throw new Error("Bob's prekey verification failed");
    }

    // console.log("Alice got Bob's bundle from contract at %s:", x3dhAddress);
    // console.log("\t", "0x" + IKb);
    // console.log("\t", "0x" + SPKb);
    // console.log("\t", "0x" + Sigb);
    // console.log("\t", "0x" + OPKb);

    const SK = calculateAliceSecret(
        priv_alice[0],
        priv_alice[1],
        IKb,
        SPKb,
        OPKb
    );

    // console.log("Shared secret:", "0x" + SK);

    return SK;

    // NOTE: code underneath kinda work.
    // The problem is that it is contrintuitive to firstly staticly call a function
    // and only after make a real transaction.

    // const txData = initMessage.interface.encodeFunctionData("getBundle");
    // const txResult = await hre.ethers.provider.call({
    //     to: await initMessage.getAddress(),
    //     data: txData,
    // });
    // const bundle = initMessage.interface.decodeFunctionResult("getBundle", txResult);
    // await initMessage.on(initMessage.getEvent("BundleRequest"), (IKb, SPKb, Sigb, OPKb) => {
    //     console.log(IKb);
    //     console.log(SPKb);
    //     console.log(Sigb);
    //     console.log(OPKb);
    // })
}

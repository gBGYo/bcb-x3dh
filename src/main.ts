import hre from "hardhat";
import { deploy as deployAlice, calcSecret as calcSecretAlice } from "./alice";
import { deploy as deployBob, calcSecret as calcSecretBob } from "./bob";
import chalk from 'chalk';
import { x25519 } from "@noble/curves/ed25519";
import { ArrayToHex } from "./x3dh";

async function main() {
    const [bob, alice, otherAccounts] = await hre.ethers.getSigners();
    const [bobContractAddress, priv_bob] = await deployBob();
    const [aliceContractAddress, priv_alice] = await deployAlice(bobContractAddress);
    console.log();

    for (let i = 0; i < 1; i++) {
        const initMessage = await hre.ethers.getContractAt("InitMessage", aliceContractAddress);

        const OPKb = x25519.getPublicKey(Buffer.from(priv_bob[2][i], 'hex'));
        //console.log("Bob got OPKb:", ArrayToHex(OPKb));

        const aliceSK = await calcSecretAlice(initMessage.connect(alice), priv_alice);
        const bobSK = await calcSecretBob(initMessage.connect(bob), [priv_bob[0], priv_bob[1], priv_bob[2][i]]);

        console.log("Alice SK: %s", chalk.red(aliceSK));
        console.log("Bob SK: %s", chalk.red(bobSK));
        console.log();
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

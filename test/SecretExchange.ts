import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { generateBobBundle } from '../src/x3dh';
import { generateAliceBundle, calculateAliceSecret, calculateBobSecret } from '../src/x3dh';

describe("Initial Message", function () {
  async function deployBundleFixture() {
    const [bob_address, otherAccount] = await hre.ethers.getSigners();
    const X3DH = await hre.ethers.getContractFactory("X3DH");

    const [priv_bob, pub_bob] = generateBobBundle();
    const x3dh = await X3DH.deploy(...pub_bob);
    return { x3dh, bob_address, pub_bob, priv_bob };
  }

  async function deployInitMessageFixture() {
    const { x3dh, pub_bob, priv_bob } = await loadFixture(deployBundleFixture);
    const [bob_address, alice_address, otherAccount] = await hre.ethers.getSigners();
    const InitMessage = await hre.ethers.getContractFactory("InitMessage");

    // const [priv_alice, pub_alice] = generateAliceBundle(pub_bob[0], pub_bob[1], pub_bob[2], pub_bob[3][0]);
    const [priv_alice, pub_alice] = generateAliceBundle();
    const OPK = pub_bob[3][0];
    const initMessage = await InitMessage.connect(alice_address).deploy(...pub_alice, x3dh.getAddress());
    return { initMessage, x3dh, alice_address, pub_bob, priv_alice, priv_bob, pub_alice, OPK };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { initMessage, alice_address } = await loadFixture(deployInitMessageFixture);

      expect(await initMessage.owner()).to.equal(alice_address);
    });
  });

  describe("Secret Exchange", function () {
    it("Should get the right bundle", async function () {
      const { initMessage, pub_bob } = await loadFixture(deployInitMessageFixture);

      // If we still have OPK return pub_bob with current OPK
      for (const OPK of pub_bob[3]) {
        await expect(initMessage.getBundle())
          .to.emit(initMessage, "BundleRequest")
          .withArgs(pub_bob[0], pub_bob[1], pub_bob[2], OPK);
      }

      // After all OPKs were used, return OPK=0
      await expect(initMessage.getBundle())
        .to.emit(initMessage, "BundleRequest")
        .withArgs(pub_bob[0], pub_bob[1], pub_bob[2], "0");
    });

    it("Bob and Alice should get the same secret", async function () {
      const { priv_alice, priv_bob, initMessage, x3dh, OPK } = await loadFixture(deployInitMessageFixture);
      let pub_alice = await initMessage.message();
      let pub_bob = await x3dh.bundle();
      const alice_SK = calculateAliceSecret(
        priv_alice[0],
        priv_alice[1],
        pub_bob[0],
        pub_bob[1],
        OPK
      );
      const bob_SK = calculateBobSecret(
        pub_alice[0],
        pub_alice[1],
        priv_bob[0],
        priv_bob[1],
        priv_bob[2][0]
      );
      expect(alice_SK).to.equal(bob_SK);
    });

  });
});

import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { generateBobBundle } from '../src/x3dh';

describe("X3DH", function () {
  async function deployBundleFixture() {
    const [bob_address, otherAccount] = await hre.ethers.getSigners();
    const X3DH = await hre.ethers.getContractFactory("X3DH");

    const [priv_bob, pub_bob] = generateBobBundle();
    const x3dh = await X3DH.deploy(...pub_bob);
    return { x3dh, bob_address, pub_bob, priv_bob };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { x3dh, bob_address } = await loadFixture(deployBundleFixture);

      expect(await x3dh.owner()).to.equal(bob_address);
    });

    it("Should set the right bundle", async function () {
      const { x3dh, pub_bob } = await loadFixture(deployBundleFixture);

      // If we still have OPK return bundle with current OPK
      for (const OPK of pub_bob[3]) {
        await expect(x3dh.requestBundle())
          .to.emit(x3dh, "BundleRequest")
          .withArgs(pub_bob[0], pub_bob[1], pub_bob[2], OPK);
      }

      // After all OPKs were used, return OPK=0
      await expect(x3dh.requestBundle())
        .to.emit(x3dh, "BundleRequest")
        .withArgs(pub_bob[0], pub_bob[1], pub_bob[2], "0");
    });
  });
});

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import { generateBobBundle } from '../../src/x3dh';

const X3DHModule = buildModule("X3DH", (m) => {
  let [priv_bob, pub_bob] = generateBobBundle();
  const x3dh = m.contract("X3DH", pub_bob);

  console.log("Deployed:");
  console.log("ID: ", '0x' + pub_bob[0]);
  console.log("SPK:", '0x' + pub_bob[1]);
  console.log("Sig:", '0x' + pub_bob[2]);
  console.log("OPKs:");
  pub_bob[3].forEach(element => {
    console.log("\t", '0x' + element);
  });

  return { x3dh };
});

export default X3DHModule;

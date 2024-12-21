import { HardhatUserConfig, extendEnvironment } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('hardhat-ethernal');

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

extendEnvironment((hre) => {
  hre.ethernalSync = true;
  hre.ethernalWorkspace = 'bcb-x3dh';
  hre.ethernalTrace = true;
  hre.ethernalResetOnStart = 'bcb-x3dh';
});


export default config;

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LotteryModule = buildModule("LotteryModule", (m) => {
  const lotteryContract = m.contract("LotteryContract");
  return { lotteryContract };
});

export default LotteryModule;

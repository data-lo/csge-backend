export type AvailableContractType = {
  contractType: "MASTER_CONTRACT" | "AMENDMENT_CONTRACT";
  id: string;
  maxAvailableAmount: string;
  newCommittedAmount?: string;
};

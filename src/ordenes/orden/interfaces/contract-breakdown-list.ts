export interface ContractBreakdownList {
    id: string;
    contractType: 'MASTER_CONTRACT' | 'AMENDMENT_CONTRACT';
    amountToUse: string;
}
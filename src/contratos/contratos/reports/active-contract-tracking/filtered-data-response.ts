export interface FilteredDataResponse {
    contractNumber: string;
    contractStatus: string;
    contractType: string;
    extensionType: string;
    contractedMin: number;
    vatContractedMin: number;
    contractedMax: number;
    vatContractedMax: number;
    reservedAmount: number;
    availableAmount: number;
    paidAmount: number;
    exercisedAmount: number;
    activeAmount: number;
    startDate: Date | null;
    endDate: Date | null;
    isAmendment: boolean;
}
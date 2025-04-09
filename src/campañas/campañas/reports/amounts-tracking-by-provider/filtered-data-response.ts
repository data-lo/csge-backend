export interface FilteredAmountsTrackingByProvider {
    providerId: string;
    contractId: string;
    providerName: string;
    providerRFC: string;

    campaignName: string;
    
    contractNumber: string;
    contractMaxAmount: number;
    contractSpentAmount: number;
    contractPaidAmount: number;

    totalOrderAmount: number;
  }

import { CAMPAIGN_STATUS } from "../../interfaces/estatus-campaña.enum";

export interface FilteredAmountsTrackingByProvider {
  providerRFC: string;
  
  startAt: Date;
  endDate: Date;

  campaignName: string;
  campaignStatus: CAMPAIGN_STATUS

  contractMaxAmount: number;
  contractSpentAmount: number;
  contractPaidAmount: number;

  totalOrderAmount: number;
}

import { CAMPAIGN_STATUS } from "../interfaces/estatus-campaña.enum";

export interface AmountsTrackingByProvider {
    // Campaign
    campaign_id: string;
    campaign_name: string;
    campaign_status: CAMPAIGN_STATUS;
    campaign_type: string;
    campaign_created_at: Date;
    campaign_updated_at: Date;

    // Activation
    activation_id: string;
    activation_start_date: Date;
    activation_end_date: Date;
    activation_created_at: Date;
    activation_updated_at: Date;
  
    // Order
    order_id: string;
    order_index: number;
    order_status: string;
    order_folio: string;
    order_service_type: string;
    order_emission_date: Date;
    order_approval_date: Date | null;
    order_subtotal: string;
    order_activation_number: number;
    order_tax: string;
    order_total: string;
    order_tax_included: boolean;
    order_previous_canceled_id: string | null;
    order_cancel_reason: string | null;
    order_from_campaign: boolean;
    order_created_at: Date;
    order_updated_at: Date;
    order_contract_id: string;
    order_campaign_id: string;
    order_partida_id: string;
    order_provider_id: string;
  
    // Provider
    provider_id: string;
    provider_number: string | null;
    provider_legal_representative: string | null;
    provider_commercial_name: string;
    provider_type: string;
    provider_rfc: string;
    provider_business_name: string;
    provider_fiscal_address: string | null;
    provider_observations: string | null;
    provider_status: boolean;
    provider_created_at: Date;
    provider_updated_at: Date;
  
    // Contract
    contract_id: string;
    contract_number: string;
    contract_status: string;
    contract_type: string;
    contract_purpose: string;
    contract_min_amount: string;
    contract_min_tax: string;
    contract_max_amount: string;
    contract_max_tax: string;
    contract_reserved_amount: string;
    contract_available_amount: string;
    contract_paid_amount: string;
    contract_spent_amount: string;
    contract_active_amount: string;
    contract_breakdown: Record<string, any>;
    contract_start_date: Date;
    contract_end_date: Date;
    contract_cancel_reason: string;
    contract_link: string;
    contract_border_tax: boolean;
    contract_created_at: Date;
    contract_updated_at: Date;
    contract_provider_id: string;

    ammendment_contract_paid_amount: number;
    ammendment_contract_executed_amount: number;
    ammendment_contract_active_amount: number;
  }
  
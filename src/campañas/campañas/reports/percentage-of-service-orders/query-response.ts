import { CAMPAIGN_STATUS } from "../../interfaces/estatus-campaña.enum";

export interface PercentageOfServiceOrders {
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
}

export interface MasterContract {
    master_contract_id: string;
    contract_number: string;
    contract_status: string;
    contract_type: string;
    contract_object: string;
    minimum_contracted_amount: string;
    vat_minimum_contracted_amount: string;
    maximum_contracted_amount: string;
    vat_maximum_contracted_amount: string;
    reserved_amount: string;
    available_amount: string;
    paid_amount: string;
    exercised_amount: string;
    active_amount: string;
    start_date: Date;
    end_date: Date;
    cancellation_reason: string;
    contract_link: string;
    border_vat: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface AmendmentContract {
    amendment_contract_id: string;
    contract_number: string;
    contract_status: string;
    minimum_contracted_amount: string;
    vat_minimum_contracted_amount: string;
    maximum_contracted_amount: string;
    vat_maximum_contracted_amount: string;
    reserved_amount: string;
    available_amount: string;
    paid_amount: string;
    exercised_amount: string;
    active_amount: string;
    start_date: Date | null;
    end_date: Date | null;
    cancellation_reason: string | null;
    contract_link: string;
    border_vat: boolean;
    extension_type: string;
    amendment_contract_type: string;
    created_at: Date;
    updated_at: Date;
    master_contract_id: string;
}

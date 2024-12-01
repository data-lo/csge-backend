export interface DocumentRejected {
    meta:              Meta;
    notification_type: string;
    notification_id:   string;
    document_title:    string;
    firmamex_id:       string;
}

export interface Meta {
    signer: string;
    reason: string;
}
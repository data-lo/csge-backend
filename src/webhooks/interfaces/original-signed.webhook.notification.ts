export interface OriginalSigned {
    signer_data:        SignerData;
    signer_email:       string;
    signer_fingerprint: string;
    user:               number;
    signer:             number;
    notification_type:  string;
    notification_id:    string;
    document_title:     string;
    firmamex_id:        string;
    text:               string;
}

export interface SignerData {
    id:          number;
    email:       string;
    fingerprint: string;
    authority:   string;
    name:        string;
}
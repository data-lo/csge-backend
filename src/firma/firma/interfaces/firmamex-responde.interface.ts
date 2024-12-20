export interface FirmamexResponse {
    document_ticket: string;
    document_flow:   boolean;
    sticker_count:   number;
    stickers:        Sticker[];
    document_url:    string;
}

export interface Sticker {
    sticker_id:          string;
    sticker_index:       number;
    sticker_email:       string;
    sticker_data:        string;
    sticker_page:        number;
    sticker_coordinates: StickerCoordinates;
    sticker_type:        string;
    sticker_image_type:  string;
    sticker_authorities: StickerAuthority[];
}

export interface StickerAuthority {
    authority_name: string;
}

export interface StickerCoordinates {
    lx: number;
    ly: number;
    ux: number;
    uy: number;
}

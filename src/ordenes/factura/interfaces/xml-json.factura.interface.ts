export interface FacturaXml {
    _declaration:       Declaration;
    "cfdi:Comprobante": CfdiComprobante;
}

export interface Declaration {
    _attributes: DeclarationAttributes;
}

export interface DeclarationAttributes {
    version:  string;
    encoding: string;
}

export interface CfdiComprobante {
    _attributes:        CfdiComprobanteAttributes;
    "cfdi:Emisor":      CfdiEmisor;
    "cfdi:Receptor":    CfdiReceptor;
    "cfdi:Conceptos":   CfdiConceptos[];
    "cfdi:Impuestos":   CfdiComprobanteCfdiImpuestos;
    "cfdi:Complemento": CfdiComplemento;
}

export interface CfdiComprobanteAttributes {
    Version:              string;
    LugarExpedicion:      string;
    Folio:                string;
    Fecha:                Date;
    FormaPago:            string;
    MetodoPago:           string;
    TipoDeComprobante:    string;
    Exportacion:          string;
    Moneda:               string;
    TipoCambio:           string;
    SubTotal:             string;
    Total:                string;
    NoCertificado:        string;
    Certificado:          string;
    "xmlns:cfdi":         string;
    "xmlns:xsi":          string;
    "xsi:schemaLocation": string;
    Sello:                string;
}

export interface CfdiComplemento {
    "tfd:TimbreFiscalDigital": TfdTimbreFiscalDigital;
}

export interface TfdTimbreFiscalDigital {
    _attributes: TfdTimbreFiscalDigitalAttributes;
}

export interface TfdTimbreFiscalDigitalAttributes {
    "xsi:schemaLocation": string;
    Version:              string;
    UUID:                 string;
    FechaTimbrado:        Date;
    RfcProvCertif:        string;
    SelloCFD:             string;
    NoCertificadoSAT:     string;
    SelloSAT:             string;
    "xmlns:tfd":          string;
    "xmlns:xsi":          string;
}

export interface CfdiConceptos {
    "cfdi:Concepto": CfdiConcepto;
}

export interface CfdiConcepto {
    _attributes:      CfdiConceptoAttributes;
    "cfdi:Impuestos": CfdiConceptoCfdiImpuestos;
}

export interface CfdiConceptoAttributes {
    ClaveProdServ: string;
    Cantidad:      string;
    ClaveUnidad:   string;
    Unidad:        string;
    Descripcion:   string;
    ValorUnitario: string;
    Importe:       string;
    ObjetoImp:     string;
}

export interface CfdiConceptoCfdiImpuestos {
    "cfdi:Traslados": CfdiTraslados;
}

export interface CfdiTraslados {
    "cfdi:Traslado": CfdiTraslado;
}

export interface CfdiTraslado {
    _attributes: CfdiTrasladoAttributes;
}

export interface CfdiTrasladoAttributes {
    Base:       string;
    Impuesto:   string;
    TipoFactor: string;
    TasaOCuota: string;
    Importe:    string;
}

export interface CfdiEmisor {
    _attributes: CfdiEmisorAttributes;
}

export interface CfdiEmisorAttributes {
    Rfc:           string;
    Nombre:        string;
    RegimenFiscal: string;
}

export interface CfdiComprobanteCfdiImpuestos {
    _attributes:      CfdiImpuestosAttributes;
    "cfdi:Traslados": CfdiTraslados;
}

export interface CfdiImpuestosAttributes {
    TotalImpuestosTrasladados: string;
}

export interface CfdiReceptor {
    _attributes: CfdiReceptorAttributes;
}

export interface CfdiReceptorAttributes {
    Rfc:                     string;
    Nombre:                  string;
    UsoCFDI:                 string;
    DomicilioFiscalReceptor: string;
    RegimenFiscalReceptor:   string;
}

// Tipos reutilizables
export interface CFDITrasladoRaw {
  Base: string;                     // ej. '36781.60'
  Impuesto: '001' | '002' | '003' | string;
  TipoFactor: 'Tasa' | 'Cuota' | 'Exento' | string;
  TasaOCuota?: string;              // ej. '0.160000' (ausente si Exento)
  Importe?: string;                 // ej. '5885.06'   (ausente si Exento)
}

export interface CFDIRetencionRaw {
  Impuesto: '001' | '002' | '003' | string;
  Importe: string;                  // ej. '1871.25'
}

/**
 * Variante 1: Solo traslados
 * { TotalImpuestosTrasladados, Traslados: { Traslado } }
 */
export interface CFDIImpuestosSoloTrasladosRaw {
  TotalImpuestosTrasladados: string;
  Traslados: {
    // xml2js puede devolver objeto o arreglo; deja ambas opciones
    Traslado: CFDITrasladoRaw | CFDITrasladoRaw[];
  };
}

/**
 * Variante 2: Con retenciones y traslados
 * { TotalImpuestosRetenidos, TotalImpuestosTrasladados, Retenciones: { Retencion }, Traslados: { Traslado } }
 */
export interface CFDIImpuestosConRetencionesRaw {
  TotalImpuestosRetenidos: string;
  TotalImpuestosTrasladados: string;
  Retenciones: {
    Retencion: CFDIRetencionRaw | CFDIRetencionRaw[];
  };
  Traslados: {
    Traslado: CFDITrasladoRaw | CFDITrasladoRaw[];
  };
}

import { Proveedor } from "../entities/proveedor.entity";

export function transformProvidersToServiceItems(providers: Proveedor[]) {
  return providers.flatMap((provider) =>
    provider.estaciones.flatMap((station) =>
      station.servicios.map((service) => ({
        serviceId: service.id,
        serviceName: service.nombreDeServicio,
        serviceRenovation: {
          renovationId: service.renovaciones[0].id,
          description: service.renovaciones[0].descripcionDelServicio,
          characteristics: {
            formatName: service.renovaciones[0].caracteristicasDelServicio.nombreFormato,
            formatType: service.renovaciones[0].caracteristicasDelServicio.tipoFormato,
            unitType: service.renovaciones[0].caracteristicasDelServicio.tipoUnidad,
            unit: service.renovaciones[0].caracteristicasDelServicio.unidad,
            symbol: service.renovaciones[0].caracteristicasDelServicio.simbolo,
            piece: service.renovaciones[0].caracteristicasDelServicio.pieza,
            printSize: service.renovaciones[0].caracteristicasDelServicio.medidaImpresion,
            timeMeasure: service.renovaciones[0].caracteristicasDelServicio.medidaTiempo,
            width: service.renovaciones[0].caracteristicasDelServicio.ancho,
            height: service.renovaciones[0].caracteristicasDelServicio.alto,
            pressSection: service.renovaciones[0].caracteristicasDelServicio.seccionPrensa,
            publicationWeb: service.renovaciones[0].caracteristicasDelServicio.webPublicacion,
            pressPages: service.renovaciones[0].caracteristicasDelServicio.paginasPrensa,
            program: service.renovaciones[0].caracteristicasDelServicio.programa,
          },
          unitPrice: service.renovaciones[0].tarifaUnitaria,
          tax: service.renovaciones[0].iva,
          isTaxIncluded: service.renovaciones[0].ivaIncluido,
          isBorderTax: service.renovaciones[0].ivaFrontera,
          status: service.renovaciones[0].estatus,
          isLastRenovation: service.renovaciones[0].esUltimaRenovacion,
        },
        serviceType: service.tipoDeServicio,
        index: service.indice,
        station: {
          stationId: station.id,
          stationName: station.nombreEstacion,
        },
        provider: {
          providerId: provider.id,
          providerName: provider.razonSocial,
          providerRFC: provider.rfc,
        },
      }))
    )
  );
}

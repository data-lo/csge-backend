export const generarSVGCalendario = (diasMarcados: number[], mes: number, anio: number): string => {
    const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const primerDia = new Date(anio, mes, 1).getDay();
  
    const celdaAncho = 15; // Reducir tamaño de celdas
    const celdaAlto = 15;
    const margen = 5;
  
    const svgWidth = 7 * celdaAncho + margen * 2; // Ajustar ancho
    const svgHeight = 7 * celdaAlto + margen * 2;
  
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="${svgWidth / 2}" y="${margen + 8}" text-anchor="middle"
        font-family="Arial" font-size="10" font-weight="bold">Calendario de ${mes + 1}/${anio}</text>`;
  
    diasSemana.forEach((dia, i) => {
      svg += `<text x="${i * celdaAncho + margen + celdaAncho / 2}" y="${margen + 18}" 
        font-family="Arial" font-size="7" text-anchor="middle">${dia}</text>`;
    });
  
    let fila = 2;
    let columna = primerDia === 0 ? 6 : primerDia - 1;
  
    for (let dia = 1; dia <= totalDias; dia++) {
      const x = columna * celdaAncho + margen;
      const y = fila * celdaAlto + margen + 10;
  
      const marcado = diasMarcados.includes(dia)
        ? 'fill="red"'
        : 'fill="none" stroke="black"';
  
      svg += `<rect x="${x}" y="${y}" width="${celdaAncho - 2}" height="${celdaAlto - 2}" 
        ${marcado} stroke-width="0.5"/>`;
  
      svg += `<text x="${x + celdaAncho / 2}" y="${y + celdaAlto - 3}" 
        font-family="Arial" font-size="7" text-anchor="middle">${dia}</text>`;
  
      columna++;
      if (columna >= 7) {
        columna = 0;
        fila++;
      }
    }
  
    svg += '</svg>';
    return svg;
  };
  

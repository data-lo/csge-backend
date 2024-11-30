export const generarSVGCalendario = (diasMarcados: number[], mes: number, anio: number): string => {
    const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const primerDia = new Date(anio, mes, 1).getDay();
  
    const celdaAncho = 15; // Ancho de celdas
    const celdaAlto = 15;  // Alto de celdas
    const margen = 5;      // Margen general
    
    const svgWidth = 7 * celdaAncho + margen * 3; 
    const svgHeight = 7 * celdaAlto + margen * 3;
  
    // SVG base
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      
      <!-- Nombre del mes y año -->
      <text x="${svgWidth / 2}" y="${margen + 5}" text-anchor="middle"
        font-family="Arial" font-size="10" font-weight="bold">${mes + 1}/${anio}</text>`;
  
    // Encabezado de días de la semana
    diasSemana.forEach((dia, i) => {
      svg += `<text x="${i * celdaAncho + margen + celdaAncho / 2}" y="${margen + 15}" 
        font-family="Arial" font-size="7" text-anchor="middle">${dia}</text>`;
    });
  
    let fila = 2;
    let columna = primerDia === 0 ? 6 : primerDia - 1;
  
    // Ajuste de posición vertical de las casillas (reduce la separación)
    const offsetVertical = 3;
  
    for (let dia = 1; dia <= totalDias; dia++) {
      const x = columna * celdaAncho + margen;
      const y = fila * celdaAlto + margen + offsetVertical;
  
      const marcado = diasMarcados.includes(dia)
        ? 'fill="red"'
        : 'fill="none" stroke="black"';
  
      // Casilla del día
      svg += `<rect x="${x}" y="${y}" width="${celdaAncho - 2}" height="${celdaAlto - 2}" 
        ${marcado} stroke-width="0.5"/>`;
  
      // Número del día
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
  
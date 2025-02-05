import axios from 'axios';
import { Content } from 'pdfmake/interfaces';
import sharp from 'sharp';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { MinioService } from 'src/minio/minio.service';

interface HeaderOptions {
  showTitle: boolean;
  showLogo: boolean;
  textoEncabezado: string;
  folio: string;
}

const fetchImaageFromUrl = async () => {
  try {
    const minioService = new MinioService();
    const minioImageUrl = await minioService.obtenerImagen();
    const imagen = await axios.get(minioImageUrl, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(imagen.data);
    return buffer;
  } catch (error) {
    return null;
  }
};

const dividirTextoPorEspacios = (texto: string, longitud: number): string => {
  const palabras = texto.split(' '); // Dividimos el texto en palabras
  let resultado = '';
  let lineaActual = '';

  for (const palabra of palabras) {
    if ((lineaActual + palabra).length > longitud) {
      resultado += lineaActual.trim() + '\n'; // Agrega la línea acumulada al resultado
      lineaActual = ''; // Reinicia la línea actual
    }
    lineaActual += palabra + ' '; // Agrega la palabra a la línea actual
  }
  resultado += lineaActual.trim();

  return resultado;
};

export const headerSection = async (
  options: HeaderOptions,
): Promise<Content> => {
  try {
    let logo: Content = null;
    const { showTitle, showLogo, textoEncabezado, folio } = options;

    if (showLogo) {
      const imageBuffer = await fetchImaageFromUrl();
      if (imageBuffer) {
        const metadata = await sharp(imageBuffer).metadata();
        const maxWidth = 150;
        const maxheight = 100;
        const scale = Math.min(
          maxWidth / metadata.width,
          maxheight / metadata.height,
        );

        const contentType = `image/${metadata.format}`;

        logo = {
          image: `data:${contentType};base64;${imageBuffer.toString('base64')}`,
          width: metadata.width * scale,
          height: metadata.height * scale,
          alignment: 'left',
          margin: [30, 20, 10, 10],
        };
      } else {
        logo = { text: '' };
      }
    }

    const headerText: Content = {
      text: `${dividirTextoPorEspacios(textoEncabezado, 50)}\n${folio}`,
      alignment: 'center',
      font: 'Poppins',
      bold: true,
      margin: [30, 30, 0, 20],
    };

    return {
      columns: [showLogo ? logo : null, showTitle ? headerText : null],
      margin: [0, 0, 0, 20],
    };
  } catch (error) {
    console.log('ERROR EN CONSTRUCCION DE IMAGE BUFFER');
    handleExeptions(error);
  }
};

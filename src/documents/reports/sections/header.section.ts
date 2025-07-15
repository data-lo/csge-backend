import axios from 'axios';
import { Content } from 'pdfmake/interfaces';
import sharp from 'sharp';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { FILE_STATUS } from 'src/minio/enums/file-status-enum';
import { MinioService } from 'src/minio/minio.service';

interface HeaderOptions {
  showTitle: boolean;
  showLogo: boolean;
  textoEncabezado: string;
  folio: string;
}

const getDocumentImage = async () => {
  try {
    const minioService = new MinioService();

    const image = await minioService.getImage();

    if (image.status === FILE_STATUS.FILE_FOUND) {

      const response = await axios.get(image.url, {
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data);

      return buffer
    }

    return FILE_STATUS.FILE_NOT_FOUND

  } catch (error) {
    return null;
  }
};

const dividirTextoPorEspacios = (texto: string, longitud: number): string => {
  const palabras = texto.split(' ');
  let resultado = '';
  let lineaActual = '';

  for (const palabra of palabras) {
    if ((lineaActual + palabra).length > longitud) {
      resultado += lineaActual.trim() + '\n';
      lineaActual = '';
    }
    lineaActual += palabra + ' ';
  }
  resultado += lineaActual.trim();

  return resultado;
};


export const headerSection = async (options: HeaderOptions,): Promise<Content> => {
  try {
    let logo: Content = null;

    const { showTitle, showLogo, textoEncabezado, folio } = options;

    if (showLogo) {

      const imageBuffer = await getDocumentImage();

      if (imageBuffer !== FILE_STATUS.FILE_NOT_FOUND) {
        const metadata = await sharp(imageBuffer).metadata();
        const maxWidth = 150;
        const maxheight = 100;
        const scale = Math.min(
          maxWidth / metadata.width,
          maxheight / metadata.height,
        );
        const contentType = `image/${metadata.format}`;

        logo = {
          image: `data:${contentType};base64,${imageBuffer.toString('base64')}`,
          width: metadata.width * scale,
          height: metadata.height * scale,
          alignment: 'left',
          margin: [30, 0, 30, 50],
        };

      } else {
        logo = { text: '' };
      }
    }

    const headerText: Content = {
      text: `${dividirTextoPorEspacios(textoEncabezado, 50)}\n${folio}`,
      alignment: 'right',
      font: 'Poppins',
      bold: true,
      background: "",
      margin: [0, 40, 60, 20],
    };

    return {
      columns: [
        {
          width: 'auto',
          stack: [logo],
          alignment: 'left',
        },

        {
          width: '*',
          stack: [headerText],
          alignment: 'right',
        },
      ],
      margin: [0, 10, 0, 30],
    };

  } catch (error) {
    handleExceptions(error);
  }
};

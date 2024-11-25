import { readdirSync } from "fs"
import { join } from "path"
import { Content } from "pdfmake/interfaces";
import sharp from "sharp";

interface HeaderOptions {
    showTitle:boolean;
    showLogo:boolean;
    textoEncabezado:string;
    folio:string
}

const refreshRoute = () => {
    const rutaDeCarga = join(__dirname,'../../../../static/uploads/imagen')
    const imagen = readdirSync(rutaDeCarga);
    const path = join(rutaDeCarga,imagen[0]);
    return path
}

const getImageDimensions = async (imagePath: string): Promise<{ width: number; height: number }> => {
    const metadata = await sharp(imagePath).metadata();
    return {
        width: metadata.width || 0,
        height: metadata.height || 0
    };
};


const dividirTextoPorEspacios = (texto: string, longitud: number): string => {
    const palabras = texto.split(" "); // Dividimos el texto en palabras
    let resultado = "";
    let lineaActual = "";

    for (const palabra of palabras) {
        if ((lineaActual + palabra).length > longitud) {
            resultado += lineaActual.trim() + "\n"; // Agrega la línea acumulada al resultado
            lineaActual = ""; // Reinicia la línea actual
        }
        lineaActual += palabra + " "; // Agrega la palabra a la línea actual
    }
    resultado += lineaActual.trim();

    return resultado;
};

export const headerSection = async (options:HeaderOptions):Promise<Content> => {
    
    let logo:Content = null;
    
    const {showTitle, showLogo, textoEncabezado, folio} = options;
    
    if(showLogo){
        const imagePath = refreshRoute();
        const {width, height} = await getImageDimensions(imagePath);

        const maxWidth = 100;
        const maxheight  = 100;
        const scale = Math.min(maxWidth/width, maxheight/height);

        logo = {
            image:imagePath,
            width: width * scale,
            height: height * scale,
            alignment: 'left',
            margin:[30,20,10,10]
        };
        
    }
    
    const headerText:Content = {
        text:`${dividirTextoPorEspacios(textoEncabezado,50)}\n${folio}`,
        alignment:'center',
        font:'Poppins',
        bold:true,
        margin: [30,30,0,20],
    }

    return {
        columns: [
            showLogo ? logo : null,
            showTitle ? headerText: null
        ],
        margin:[0,0,0,20]
    }
}
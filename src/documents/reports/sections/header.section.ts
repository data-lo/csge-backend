import { readdirSync } from "fs"
import { join } from "path"
import { Content } from "pdfmake/interfaces";
import sharp from "sharp";

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


interface HeaderOptions {
    showTitle:boolean;
    showLogo:boolean;
}

export const headerSection = async (options:HeaderOptions):Promise<Content> => {
    
    let logo:Content = null;
    
    const {showTitle, showLogo} = options;
    if(showLogo){
        const imagePath = refreshRoute();
        const {width, height} = await getImageDimensions(imagePath);

        console.log(width,height);

        const maxWidth = 100;
        const maxheight  = 100;
        const scale = Math.min(maxWidth/width, maxheight/height);
        console.log(scale);
        console.log({
            width: width * scale,
            height: height * scale,
        })
        logo = {
            image:imagePath,
            width: width * scale,
            height: height * scale,
            alignment: 'left',
            margin:[30,20,10,10]
        };
        
    }
    
    const headerText:Content = {
        text:'COORDINACIÓN DE COMUNICACIÓN\n DE GOBIERNO DEL ESTADO DE \n CHIHUAHUA',
        alignment:'center',
        bold:true,
        margin: [30,30,0,20]
    }

    return {
        columns: [
            showLogo ? logo : null,
            showTitle ? headerText: null
        ],
        margin:[0,0,0,20]
    }
}
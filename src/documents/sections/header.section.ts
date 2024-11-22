import {Content} from "pdfmake/interfaces";


const logo:Content = {
    image:'../../../static/uploads/imagen',
    width:200,
    height:150,
}

interface HeaderOptions{

}


export const headerSection = (options:HeaderOptions):Content => {
    
    const headerLogo:Content = logo;
    return 
}
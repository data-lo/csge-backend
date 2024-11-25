import { Content } from "pdfmake/interfaces";

interface FooterOptions {
    currentPage:number;
    pageCount:number;
}

interface FooterDinamicOptions {
    textoPieDePagina:string;
    presupuestoText:string;
}

export const footerPageSection = (footerOption:FooterOptions) => {
    const footerPage:Content = {
        text:`${footerOption.currentPage} de ${footerOption.pageCount}`,
        //alignment:'right',
        //marginRight:40,
        font:'Poppins'
    }
    return footerPage;
}

export const footerSection = (footerOptions:FooterDinamicOptions) => {
    
    const {textoPieDePagina,presupuestoText} = footerOptions;
    const footerTextPieDePaginaC:Content = {
        text:`${textoPieDePagina}`,
        alignment:'center',
        font:'Poppins'
    }
    
    const presupuestoTextC:Content = {
        text:`${presupuestoText}`,
        alignment:'center',
        font:'Poppins'
    }

    return  {
        columns:[
            footerTextPieDePaginaC,
            presupuestoTextC,
        ]    
    }
}
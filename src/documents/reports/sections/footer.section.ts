import { Content } from 'pdfmake/interfaces';

interface FooterDinamicOptions {
  textoPieDePagina: string;
  presupuestoText: string;
}

export const footerSection = (footerOptions: FooterDinamicOptions) => {
  const { textoPieDePagina, presupuestoText } = footerOptions;
  const footerTextPieDePaginaC: Content = {
    text: `${textoPieDePagina}`,
    alignment: 'center',
    font: 'Poppins',
    marginBottom: 30,
  };

  const presupuestoTextC: Content = {
    text: `${presupuestoText}`,
    alignment: 'center',
    font: 'Poppins',
    marginBottom: 30,
  };

  return {
    footerTextPieDePaginaC,
    presupuestoTextC,
  };
};

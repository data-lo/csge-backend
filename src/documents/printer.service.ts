import { Injectable } from "@nestjs/common";
import PdfPrinter from 'pdfmake';
import { BufferOptions, TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
    Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Medium.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    },
    Poppins: {
        normal: 'fonts/Poppins/Poppins-Regular.ttf',
        bold: 'fonts/Poppins/Poppins-Bold.ttf',
        italics: 'fonts/Poppins/Poppins-Italic.ttf',
    }
}

@Injectable()
export class PrinterService {

    private printer = new PdfPrinter(fonts);
    createPdf(
        documentDefinition: TDocumentDefinitions,
        options: BufferOptions = {}
    ): PDFKit.PDFDocument {
        return this.printer.createPdfKitDocument(documentDefinition, options)
    }

}
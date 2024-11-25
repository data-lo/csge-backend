export class DateFormatter {

    static formater = new Intl.DateTimeFormat('es-ES',{
        year:'numeric',
        month:'long',
        day:'2-digit'
    })
    //method
    static getDDMMYYYY(date:Date): string{
        return this.formater.format(date);
    }

}
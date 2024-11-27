import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";
import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { EstatusDeFirma } from "../interfaces/estatus-de-firma.enum";

@Entity('documentos_firma')
export class Firma {

    @PrimaryColumn({
        type:'uuid',
        name:'orden_o_factura_id',
        nullable:false
    })
    ordenOFacturaId:string;

    @Column({
        type:'boolean',
        name:'esta_firmado',
        nullable:false,
        default:false
    })
    estaFirmado:boolean;

    @Column({
        type:'enum',
        enum:EstatusDeFirma,
        default:EstatusDeFirma.APROBADA
    })
    estatusDeFirma:EstatusDeFirma

    @Column({
        type:'bytea',
        name:'documento_en_bytes',
        nullable:true
    })
    docBase64:string;

    @Column({
        name:'url_de_documento_en_firmamex',
        nullable:false,
        default:'sin_url'
    })
    documentoUrlFirmamex:string
    
    @Column({
        name:'ticket_de_documento_firmamex',
        type:'uuid',
        nullable:false,
    })
    ticket:string;

    @ManyToMany(
        () => Usuario, 
        (usuario) => usuario.documentosParaFirmar
    )
    usuariosFirmadores:Usuario;


    
}

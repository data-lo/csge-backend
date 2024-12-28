import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";
import { Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { EstatusDeFirma } from "../interfaces/estatus-de-firma.enum";
import { TipoDeDocumento } from "src/administracion/usuarios/interfaces/usuarios.tipo-de-documento";

@Entity('documentos_firma')
export class Firma {


    @PrimaryColumn('uuid')
    @Generated('uuid')
    id:string;

    @Column({
        type:'uuid',
        name:'orden_o_factura_id',
        nullable:false,
        unique:true
    })
    ordenOFacturaId:string;

    @Column({
        name:'tipo_de_documento',
        type:'enum',
        enum:TipoDeDocumento
    })
    tipoDeDocumento:TipoDeDocumento

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
        nullable:false,
        default:EstatusDeFirma.PENDIENTE_DE_FIRMA
    })
    estatusDeFirma:EstatusDeFirma;

    @Column({
        name:'url_de_documento_en_firmamex',
        nullable:false,
        default:'sin_url'
    })
    documentoUrlFirmamex:string
    
    @Column({
        name:'ticket_de_documento_firmamex',
        type:'uuid',
        nullable:true,
        default:null
    })
    ticket:string;

    @ManyToMany(
        () => Usuario, 
        (usuario) => usuario.documentosParaFirmar
    )
    @JoinTable({
        name: 'usuarios_documentos_firma',
        joinColumn: {
            name: 'documento_firma_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'usuario_id',
            referencedColumnName: 'id'
        }
    })
    usuariosFirmadores:Usuario[];
}

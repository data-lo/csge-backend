import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";
import { Column, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { ESTATUS_DE_FIRMA } from "../interfaces/estatus-de-firma.enum";
import { TIPO_DE_DOCUMENTO } from "src/administracion/usuarios/interfaces/usuarios.tipo-de-documento";
import { SignedBy } from "../interfaces/signed-by";

@Entity('documentos_firma')
export class Firma {


    @PrimaryColumn('uuid')
    @Generated('uuid')
    id: string;

    @Column({
        type: 'uuid',
        name: 'orden_o_factura_id',
        nullable: false,
        unique: true
    })
    ordenOFacturaId: string;

    @Column({
        name: 'tipo_de_documento',
        type: 'enum',
        enum: TIPO_DE_DOCUMENTO
    })
    tipoDeDocumento: TIPO_DE_DOCUMENTO

    @Column({
        type: 'boolean',
        name: 'esta_firmado',
        nullable: false,
        default: false
    })
    estaFirmado: boolean;

    @Column({
        type: 'enum',
        enum: ESTATUS_DE_FIRMA,
        nullable: false,
        default: ESTATUS_DE_FIRMA.PENDIENTE_DE_FIRMA
    })
    estatusDeFirma: ESTATUS_DE_FIRMA;

    @Column({
        name: 'url_de_documento_en_firmamex',
        nullable: false,
        default: 'sin_url'
    })
    documentoUrlFirmamex: string

    @Column({
        name: 'ticket_de_documento_firmamex',
        type: 'uuid',
        nullable: true,
        default: null
    })
    ticket: string;


    @Column({
        name: 'signed_by',
        nullable: false,
        default: {},
        type: 'jsonb'
    })
    signedBy: SignedBy;

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
    usuariosFirmadores: Usuario[];
}

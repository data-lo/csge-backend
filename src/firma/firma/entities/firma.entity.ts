import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, Generated, JoinTable, ManyToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ESTATUS_DE_FIRMA } from "../interfaces/estatus-de-firma.enum";
import { TIPO_DE_DOCUMENTO } from "src/administracion/usuarios/interfaces/usuarios.tipo-de-documento";
import { SignedBy } from "../interfaces/signed-by";
import { SIGNATURE_ACTION_ENUM } from "../enums/signature-action-enum";

@Entity('documentos_firma')
export class Firma {


    @PrimaryColumn('uuid')
    @Generated('uuid')
    id: string;

    @Column({
        type: 'uuid',
        name: 'document_id',
        nullable: false,
    })
    documentId: string;

    @Column({
        name: 'document_type',
        type: 'enum',
        enum: TIPO_DE_DOCUMENTO
    })
    documentType: TIPO_DE_DOCUMENTO

    @Column({
        type: 'boolean',
        name: 'is_signed',
        nullable: false,
        default: false
    })
    isSigned: boolean;

    @Column({
        type: 'enum',
        enum: ESTATUS_DE_FIRMA,
        nullable: false,
        default: ESTATUS_DE_FIRMA.PENDIENTE_DE_FIRMA
    })
    estatusDeFirma: ESTATUS_DE_FIRMA;

    @Column({
        name: 'url_documento_firmamex',
        nullable: false,
        default: 'sin_url'
    })
    firmamexDocumentUrl: string

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

    @Column({
        name: 'activation_id',
        nullable: true,
        default: null,
    })
    activationId: string;

    @Column({
        name: 'signature_action',
        type: 'enum',
        enum: SIGNATURE_ACTION_ENUM,
        default: SIGNATURE_ACTION_ENUM.APPROVE,
        nullable: false,
    })
    signatureAction: SIGNATURE_ACTION_ENUM;
    

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'update_at',
    })
    updateAt: Date;

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

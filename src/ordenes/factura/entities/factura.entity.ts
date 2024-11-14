import { Proveedor } from "src/proveedores/proveedor/entities/proveedor.entity";
import { Column, Entity, Generated, ManyToOne, PrimaryColumn, OneToMany } from 'typeorm';
import { EstatusFactura } from "../interfaces/estatus-factura";
import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";

@Entity('facturas')
export class Factura {
    
    @PrimaryColumn('uuid')
    id:string;

    concepto:string;

    @ManyToOne(()=>Proveedor,(proveedor)=>proveedor.id)
    proveedor:Proveedor;

    @Column({
        name:'subtotal_factura',
        type:"decimal",
        default:0.00,
        scale:2,
        nullable:false
    })
    subtotal:number;

    @Column({
        name:'iva_factura',
        type:"decimal",
        default:0.00,
        scale:2,
        nullable:false
    })
    iva:number;

    @Column({
        name:'total_factura',
        type:"decimal",
        default:0.00,
        scale:2,
        nullable:false
    })
    total:number;

    @Column({
        name:'ruta_al_archivo_pdf',
        nullable:false,
        default:false,
    })
    pdf:string;

    @Column({
        name:'ruta_al_archivo_xml',
        nullable:false,
        default:false,
    })
    xml:string;

    @Column({
        name:'validacion_testigo',
        type:'boolean',
        nullable:false,
        default:false
    })
    validacionTestigo:boolean;

    @Column({
        name:'fecha_de_aprobacion',
        type:'date',
        nullable:true,
        default:null
    })
    fechaAprobacion:Date;


    @Column({
        name:'fecha_de_validacion',
        type:'date',
        nullable:false,
    })
    fechaValidacion:Date;

    @Column({
        name:'fecha_de_recepcion',
        type:'date',
        nullable:true,
        default:null
    })
    fechaDeRecepcion:Date;

    @Column({
        name:'fecha_de_pago',
        type:'date',
        nullable:true,
        default:null
    })
    fechaDePago:Date;

    @Column({
        name:'estatus_de_factura',
        type:'enum',
        enum:EstatusFactura,
        default:EstatusFactura.RECIBIDA,
        nullable:false
    })
    estatus:EstatusFactura;

    @Column({
        name:'motivo_cancelacion',
        nullable:true,
        default:null
    })
    motivoCancelacion:string;

    @ManyToOne(()=> Usuario, (usuario) => usuario.id)
    usuarioTestigo:Usuario;

}

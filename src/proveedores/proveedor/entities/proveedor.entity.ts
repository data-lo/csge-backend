import { Column, Entity, Generated, OneToMany, PrimaryColumn } from "typeorm";
import { TipoProveedor } from "../interfaces/tipo-proveedor.interface";
import { Contrato } from "src/contratos/contratos/entities/contrato.entity";
import { Contacto } from "src/proveedores/contacto/entities/contacto.entity";
import { Estacion } from "src/proveedores/estacion/entities/estacion.entity";

@Entity('proveedores')
export class Proveedor {
    
    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @Column({
        name:'numero_de_proveedor',
        nullable:true,
    })
    numeroProveedor:string;

    //ordenDeServicio
    //OneToMany 

    @OneToMany(() => Contrato, (contrato) => contrato.proveedor)
    contratos:Contrato[];
    
    @Column({
        name:'representante_legal',
        nullable:true,
        length:120
    })
    representanteLegal:string;

    @Column({
        name:'nombre_comercial',
        nullable:true,
        default:null,
    })
    nombreComercial:string;

    @Column({
        name:'tipo_de_proveedor',
        type:'enum',
        enum:TipoProveedor,
        default:TipoProveedor.PUBLICIDAD
    })
    tipoProveedor:TipoProveedor;

    @OneToMany(() => Contacto, (contacto) => contacto.proveedor)
    contactos:Contacto[];

    @Column({
        name:'rfc',
        length:'13',
        nullable:true,
    })
    rfc:string;
    
    
    @Column({
        name:'razon_social',
        length:100,
        nullable:true,
        default:null
    })
    razonSocial:string;

    @Column({
        name:'domicilio_fiscal',
        length:200,
        nullable:true,
        default:null
    })
    domicilioFiscal:string;

    @OneToMany(() => Estacion, (estacion) => estacion.proveedor)
    estaciones:Estacion[]

    @Column({
        name:'observaciones_del_proveedor',
        nullable:true,
        default:null
    })
    observacionesProveedor:string;

    @Column({
        name:'estatus',
        type:'boolean',
        default:true,
        nullable:false
    })
    estatus:boolean;
}

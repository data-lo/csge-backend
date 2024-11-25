import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";
import { Factura } from "src/ordenes/factura/entities/factura.entity";
import { Orden } from "src/ordenes/orden/entities/orden.entity";
import { Entity, Generated, ManyToOne, PrimaryColumn } from "typeorm";

@Entity('documentos_firma')
export class Firma {

    @Generated('uuid')
    @PrimaryColumn('uuid')
    id:string;

    @ManyToOne(()=>Orden, (orden)=> orden.id)    
    ordenesDeServicio:Orden[];

    @ManyToOne(()=>Factura,(factura)=> factura.id)
    facturas:Factura[]

    @ManyToOne(()=>Usuario,(usuario) => usuario.id)
    usuarios:Usuario[]
}

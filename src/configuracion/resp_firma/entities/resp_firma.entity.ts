import { Column, Entity, Generated, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { TipoDeDocumento } from "../interfaces/tipo-de-documento";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";
import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";

@Entity('responsables_de_firma')
export class ResponsableFirma {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        name:'tipo_de_documento',
        type:"enum",
        enum:TipoDeDocumento,
    })
    tipoDeDocumento:TipoDeDocumento;

    @Column({
        name:'tipo_de_servicio',
        type:"enum",
        enum:TipoDeServicio,
        array:true,
        nullable:true,
        unique:true
    })
    tipoDeServicio:TipoDeServicio[];

    @ManyToMany(()=> Usuario, usuario => usuario.firmasResponsables,{
        cascade:true,
    })
    @JoinTable({
        name:'usuario_responsable',
        joinColumn:{
            name:'responsable_id',
            referencedColumnName:'id',
        },
        inverseJoinColumn:{
            name:'usuario_id',
            referencedColumnName:'id'
        },
    })
    responsables:Usuario[];
   
}
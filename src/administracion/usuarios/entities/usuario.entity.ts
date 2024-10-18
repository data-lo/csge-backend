import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { ValidPermises } from "../interfaces/usuarios.permisos";
import { ValidRoles } from "../interfaces/usuarios.roles";
import { Departamento } from "src/administracion/departamentos/entities/departamento.entity";
import { Puesto } from "src/administracion/puestos/entities/puesto.entity";

@Entity('usuarios')
export class Usuario {
    @PrimaryColumn("uuid")
    @Generated("uuid")
    id:string;

    @Column({
        type:"bool",
        default:true
    })
    estatus:boolean;

    @Column({
        length:100
    })
    nombres:string;

    @Column({
        length:50
    })
    primerApellido:string;

    @Column({
        length:50,
        nullable:true
    })
    segundoApellido:string;

    @Column({type:"uuid"})
    puestoId:string
    @ManyToOne(()=>Puesto,{eager:true})
    @JoinColumn({name:'puestoId'})
    puesto:Puesto;

    
    @Column({type:"uuid"})
    departamentoId:string
    @ManyToOne(()=>Departamento,{eager:true})
    @JoinColumn({name:'departamentoId'})
    departamento:Departamento;
    
    @Column({
        length:50,
        unique:true
    })
    correo:string;

    @Column({
        length:255
    })
    password:string;

    @Column({
        unique:true
    })
    numeroDeEmpleado:string;

    @Column({
        type:"enum",
        enum:ValidRoles,
        default:ValidRoles.AGENTE
    })
    rol:ValidRoles;

    @Column({
        type:"enum",
        enum:ValidPermises,
        array:true
    })
    permisos:ValidPermises[];
}

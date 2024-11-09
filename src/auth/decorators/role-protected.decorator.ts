import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from 'src/administracion/usuarios/interfaces/usuarios.roles';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {
    return SetMetadata(META_ROLES,args);
}

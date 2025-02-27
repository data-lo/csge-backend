import { SetMetadata } from '@nestjs/common';
import { VALID_ROLES } from 'src/administracion/usuarios/interfaces/usuarios.roles';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: VALID_ROLES[]) => {
    return SetMetadata(META_ROLES,args);
}

import {
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    ConflictException,
  } from "@nestjs/common";
  
  export const handleExeptions = (error: any) => {


    if(error.message){
      throw new BadRequestException(error.message);

    }
    if (error.detail) {
      throw new BadRequestException(error.detail);
    }
  
    if (error.code) {
      switch (error.code) {
        case '23505': // Violación de constraint UNIQUE (PostgreSQL)
          throw new ConflictException('¡Error: Registro duplicado detectado!');
        case '23503': // Violación de clave foránea
          throw new BadRequestException('¡Error: Violación de clave foránea!');
        case '23502': // Campo que no puede ser nulo
          throw new BadRequestException('¡Error: Falta uno o más campos obligatorios!');
        default:
          throw new InternalServerErrorException('¡Error inesperado en la base de datos!');
      }
    }


    if (error.status === 404) {
      throw new NotFoundException(error.message || 'Recurso no encontrado');
    }
    throw new InternalServerErrorException('Error interno del servidor');
  };
  
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
        case '23505': // Código de error para violación de constraint UNIQUE (PostgreSQL)
          throw new ConflictException('Registro duplicado detectado');
        case '23503': // Código de error para violación de clave foránea
          throw new BadRequestException('Violación de clave foránea');
        case '23502': // Código de error para campo no puede ser nulo
          throw new BadRequestException('Uno o más campos obligatorios faltan');
        default:
          throw new InternalServerErrorException('Error inesperado en la base de datos');
      }
    }

    if (error.status === 404) {
      throw new NotFoundException(error.message || 'Recurso no encontrado');
    }
    throw new InternalServerErrorException('Error interno del servidor');
  };
  
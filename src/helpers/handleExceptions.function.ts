import { BadRequestException } from "@nestjs/common";

export const handleExeptions = (error:any)=>{
    throw new BadRequestException(error.detail);
};
    

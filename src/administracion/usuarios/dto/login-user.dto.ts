import { IsEmail, IsString, IsStrongPassword, MaxLength} from "class-validator";

export class LoginUserDto{

   @IsString()
   @IsEmail()
   correo:string;
   
   @IsString()
   @MaxLength(50)
   password:string;

}
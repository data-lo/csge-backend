import { IsString, IsStrongPassword } from "class-validator";

export class UpdatePasswordDto {
    @IsString()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minUppercase:1,
        minNumbers:1
    })
    password:string;
}
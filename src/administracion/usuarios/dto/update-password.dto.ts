import { IsString, IsUUID, Matches, MinLength } from "class-validator";

export class UpdatePasswordDto {
    
    @IsString()
    @MinLength(8)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
     })
    newPassword:string;

    @IsUUID()
    @IsString()
    userId:string;
}
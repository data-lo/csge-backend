import { Catch, ArgumentsHost, HttpStatus, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Request, Response } from 'express';
import { LoggerService } from "../logger/logger.service";
import { errorMonitor } from "events";

type MyResponseObj = {
    statusCode: number,
    timestamp: string,
    path: string,
    response: string | object
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter{
    private readonly logger = new LoggerService(AllExceptionsFilter.name)

    catch(exception: any, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const internalServererrrorResponse = (error) => {
            return {
                message:"Inernal Server Error",
                error:error.mesagge,
                statusCode:500
            }
        }

        const myResponseObj: MyResponseObj = {
            statusCode:500,
            timestamp:new Date().toISOString(),
            path:request.url,
            response:'',
        }

        if(exception instanceof HttpException){
            myResponseObj.statusCode = exception.getStatus(),
            myResponseObj.response = exception.getResponse()
        
        }else{
            myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            myResponseObj.response = internalServererrrorResponse(exception)
        };

        response.status(myResponseObj.statusCode)
                .json(myResponseObj)

        this.logger.error(myResponseObj.response, AllExceptionsFilter.name);
        
        super.catch(exception, host);
    };
}
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import {
    AppException,
    LogicException,
    NotFoundException,
    UnauthorizedException
} from './exceptions';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
    logger = new Logger(AppExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof ZodError) {
            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
                errors: exception.issues,
                message: exception.message
            });
        }

        if (exception instanceof HttpException) {
            return response.status(exception.getStatus()).json({
                message: exception.message
            });
        }

        if (exception instanceof AppException) {
            let status: number = HttpStatus.BAD_REQUEST;
            if (exception instanceof LogicException) {
                status = HttpStatus.BAD_REQUEST;
            } else if (exception instanceof NotFoundException) {
                status = HttpStatus.NOT_FOUND;
            } else if (exception instanceof UnauthorizedException) {
                status = HttpStatus.UNAUTHORIZED;
            }

            return response.status(status).json({
                message: exception.message
            });
        }

        this.logger.error(exception);

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'internal server error'
        });
    }
}

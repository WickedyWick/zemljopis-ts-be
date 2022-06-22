import httpStatus from 'http-status'
import { NumberLiteralType } from 'typescript';

interface CustomError extends Error {
    message: string
    status?: number
    stack?: string
}

export class ApiError extends Error implements CustomError {
    errors: any | undefined
    status: number | undefined

    constructor({ message, status = httpStatus.BAD_REQUEST, stack, name}: CustomError) {
        super(message)
        this.name = name || this.constructor.name
        this.message = message
        this.status = status
        this.stack = stack
    }
}
// errors/AppError.js

/**
 * Base class สำหรับ error ของแอปพลิเคชัน
 *
 * @extends Error
 *
 * @property {string} message - ข้อความ Error
 * @property {number} status - HTTP status code
 * @property {string} code - Application / business error code
 *
 * @example
 * throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED")
 */ 

export class AppError extends Error {
    constructor(message , status = 500 , code = "APP_ERROR"){
        super(message);
        this.status = status;
        this.code = code;
        this.isOperational = true ;
        Error.captureStackTrace(this , this.constructor)
    }
}
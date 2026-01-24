// errors/TransactionError.js

/**
 * Error สำหรับกติกาทางธุรกิจที่เกี่ยวข้องกับธุรกรรม (Transaction)
 *
 * @extends AppError
 *
 * @property {string} message - ข้อความ Error
 * @property {number} status - HTTP status code
 * @property {string} code - Application / business error code
 *
 * @example
 * throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED")
 */ 

import { AppError } from "./AppError.js";

export class TransactionError extends AppError {
    constructor(message , status  = 400 , code = "TX_Error"){
        super(message , status , code)
    }
}

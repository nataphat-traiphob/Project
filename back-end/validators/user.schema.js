import {z} from 'zod'

/**
 * สำหรับ admin สร้าง user
 */

export const createUserSchema = z.object({
    fname : z.string().min(1),
    lname : z.string().min(1),
    email : z.email(),
    password_input : z.string().min(8),
    address : z.string().min(1),
    tel : z.string().regex(/^0[0-9]{9}$/ , 'Invalid phone number'),
    role : z.enum(["user", "admin"]).optional()
})

/**
 * สำหรับ admin แก้ไข user
 */

export const updateUserSchema = z.object({
    fname : z.string().optional(),
    lname : z.string().optional(),
    address : z.string().optional(),
    tel : z.string().regex(/^0[0-9]{9}$/ , 'Invalid phone number').optional(),
    role : z.enum(["user" , "admin"]).optional()
})
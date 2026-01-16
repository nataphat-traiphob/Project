import {z} from 'zod'

/**
 * สำหรับเข้าสู่ระบบ
 */

export const LoginSchema = z.object({
    email : z.email(),
    password : z.string().min(8)
})


/**
 * สำหรับ user ลงทะเบียน
 */

export const RegisterSchema = z.object({
    fname : z.string().min(1),
    lname : z.string().min(1),
    email : z.email(),
    password_input : z.string().min(8),
    address : z.string().min(1),
    tel : z.string().regex(/^0[0-9]{9}$/ , 'Invalid phone number'),
})
import {z} from "zod";

/**
 * สำหรับ user แก้ไขตนเอง
 */

export const updateUserSchema = z.object({
    fname : z.string().optional(),
    lname : z.string().optional(),
    address : z.string().optional(),
    tel : z.string().regex(/^0[0-9]{9}$/ , 'Invalid phone number').optional(),
})
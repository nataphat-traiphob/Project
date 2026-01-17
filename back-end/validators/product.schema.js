import {z} from 'zod'

/**
 * สำหรับ admin สร้าง product
 */

export const createProductSchema = z.object({
    pd_name : z.string().min(1),
    pd_price : z.coerce.number().positive(),
    pd_detail : z.string().min(1),
    pd_category : z.string().min(1),
})

/**
 * สำหรับ admin แก้ไข product
 */

export const updateProductSchema = z.object({
    pd_name : z.string().optional(),
    pd_price : z.coerce.number().positive().optional(),
    pd_detail : z.string().optional(),
    pd_category : z.string().optional(),
})
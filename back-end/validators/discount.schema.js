import z from "zod";

/**
 * สำหรับ admin สร้าง product_discount
 */

export const createProductDiscountSchema = z.object({
    pd_id : z.string().min(1),
    dis_type:z.enum(['percent' , 'amount']),
    dis_value : z.coerce.number().positive(),
    start_at : z.string().min(1),
    end_at : z.string().min(1),
})

/**
 * สำหรับ admin แก้ไข product_discount
 */

export const updateProductDiscountSchema = z.object({
    pd_id : z.string().min(1),
    dis_type:z.enum(['percent' , 'amount']),
    dis_value : z.coerce.number().positive().optional(),
    start_at : z.string().optional(),
    end_at : z.string().optional(),
})
import {z} from 'zod'

/**
 * สำหรับ admin สร้าง anncouncement
 */

export const createAnncouncementSchema = z.object({
    title : z.string().min(1),
    description : z.string().min(1),
    start_at : z.string().min(1),
    end_at : z.string().min(1),
})

/**
 * สำหรับ admin แก้ไข anncouncement
 */

export const updateAnncouncementSchema = z.object({
    title : z.string().optional(),
    description : z.string().optional(),
    start_at : z.string().optional(),
    end_at : z.string().optional(),
})
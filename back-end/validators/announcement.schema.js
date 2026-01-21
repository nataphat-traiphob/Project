import {z} from 'zod'

/**
 * สำหรับ admin สร้าง anncouncement
 */

export const createAnnouncementSchema = z.object({
    title : z.string().min(1),
    description : z.string().min(1),
})

/**
 * สำหรับ admin แก้ไข anncouncement
 */

export const updateAnnouncementSchema = z.object({
    title : z.string().optional(),
    description : z.string().optional(),
})
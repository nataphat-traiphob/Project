import path from 'path'

/**
 * ศูนย์กลาง path ของรูปภาพ
 * 
 * เปลี่ยน path ทีเดียว -> ทุกที่เปลี่ยนตาม
 */

export const IMAGE_FOLDERS = {
    product : {
        active : path.resolve("uploads/products/active"),
        archive : path.resolve("uploads/products/archive")
    },
    announcement : {
        active : path.resolve("uploads/announcement/active"),
        archive : path.resolve("uploads/announcement/archive")
    }
}
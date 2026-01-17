import fs from 'fs/promises'
import { IMAGE_FOLDERS } from './imageFolder'
import path from 'path'

/**
 * archiveImage(type, filename)
 *
 * ย้ายรูปที่ไม่ใช้งานแล้วไปไว้ในโฟลเดอร์ archive
 * ใช้กับกรณี soft delete
 *
 * @param {string} type - ประเภทไฟล์ (เช่น "products", "announcements")
 * @param {string} filename - ชื่อไฟล์ (เช่น "abc.jpg")
 *
 */

export const archiveImage = async(type , filename) => {
    if(!filename) return

    const folders = IMAGE_FOLDERS[type]
    
        if(!folders){
            console.error(`Unknow image type : ${type}`)
            return
        }
    
        const fromPath = path.join(folders.active , filename)
        const toPath = path.join(folders.archive , filename)
        
        try{
            await fs.mkdir(folders.archive , {recursive : true})
    
            await fs.access(fromPath)
    
            await fs.rename(fromPath , toPath)
        }
        catch(e){
            if(e.code === "ENOENT") return
            console.error("Archive image failed:" , e.message)
        }
}
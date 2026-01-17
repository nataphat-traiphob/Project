import fs from 'fs/promises'
import { IMAGE_FOLDERS } from './imageFolder'
import path from 'path'

/**
 * restoreImage(type, filename)
 *
 * ย้ายรูปที่ต้องการกู้คืนหรือใช้งานอีกครั้งไปไว้ในโฟลเดอร์ active
 * ใช้กับกรณี restore
 *
 * @param {string} type - ประเภทไฟล์ (เช่น "products", "announcements")
 * @param {string} filename - ชื่อไฟล์ (เช่น "abc.jpg")
 *
 */

export const restoreImage = async(type , filename) => {
    if(!filename) return

    const folders = IMAGE_FOLDERS[type]

    if(!folders){
        console.error(`Unknow image type : ${type}`)
        return
    }

    const fromPath = path.join(folders.archive , filename)
    const toPath = path.join(folders.active , filename)
    
    try{
        await fs.mkdir(folders.active , {recursive : true})

        await fs.access(fromPath)

        await fs.rename(fromPath , toPath)
    }
    catch(e){
        if(e.code === "ENOENT") return
        console.error("Restore image failed:" , e.message)
    }
}
import fs from 'fs'
import path from 'path'
import { IMAGE_FOLDERS } from './imageFolder';

/**
  * deleteImage(type , state , filename)
  * 
  * ลบรูปจากประเภทไฟล์ที่กำหนด
  * ใช้กับกรณี hard หรือ update รูปใหม่
  * 
  * @param {string} type - ประเภทไฟล์ (เช่น "products", "announcements")
  * @param {("active"|"archive")} state - สถานะของไฟล์
  * @param {string} filename - ชื่อไฟล์ (เช่น "abc.jpg")
  * 
  */

export const deleteImage = (type , state , filename) => {
    if(!filename) return;
    if(filename.includes("..")) return

    const dir = IMAGE_FOLDERS[type]?.[state]
    if(!dir) return

    const filePath = `${dir}/${filename}`

    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath)
    }
}
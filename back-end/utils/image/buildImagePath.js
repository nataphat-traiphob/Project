 /**
  * buildImagePath(type , state , filename)
  * 
  * สร้าง URL สำหรับที่อยู่รูปจากฝั่ง client
  * ใช้สำหรับแสดงผลข้อมูล (read-only)
  * 
  * @param {string} type - ประเภทไฟล์ (เช่น "products", "announcements")
  * @param {("active"|"archive")} state - สถานะของไฟล์
  * @param {string} filename - ชื่อไฟล์ (เช่น "abc.jpg")
  * @returns {string|null} URL ของรูป
  * ตัวอย่าง : 
  *  - /uploads/products/active/abc.jpg
  */

export const buildImagePath = (type , state , filename) => {
    return filename ? `/uploads/${type}/${state}/${filename}` : null
}
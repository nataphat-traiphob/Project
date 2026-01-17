import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination : (req , file , cb) => {
        cb(null , "uploads/products/active")
    },
    filename : (req , file , cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
        cb(null , name)
    }
})

const fileFilter = (req , file , cb) => {
    if(!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files allowed"), false)
    }
    else {
        cb(null , true)
    }
}

export const uploadProductImage = multer({
    storage ,
    fileFilter,
    limits : {fileSize : 2 * 1024 * 1024}
})
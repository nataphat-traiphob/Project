export const requireImage = (req , res , next) => {
    if(!req.file){
        return res.status(400).json({
            success : false,
            message : 'image is required'
        })
    }
    next()
}
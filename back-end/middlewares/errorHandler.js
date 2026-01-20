import multer from "multer";

export default (err,req,res,next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Multer Error
    if (err instanceof multer.MulterError){
        status = 400

        switch (err.code){
            case 'LIMIT_FILE_SIZE':
                message = 'File size exceeds 2MB limit'
                break
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field'
                break
            default :
                message = err.message
        } 
    }
    
    
    // File filter error (เช่น Only image files allowed)
    else if (err.message === 'Only image files allowed') {
        status = 400
    }



    // JSON parse error
    else if (err instanceof SyntaxError && err.status === 400 && 'body' in err){
        status = 400
        message = 'Invalid JSON format'
    }


    // Development log
    if(process.env.NODE_ENV !== 'production') {
        console.log('[ERROR]',err)
    }
    res.status(status).json({success:false , message})
}
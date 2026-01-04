import jwt from 'jsonwebtoken'

const auth = (...roles) => {
    return (req,res,next) => {
        try {

            // ดู method / path ที่ส่งเข้า
            console.log('[AUTH] hit:', req.method , req.originalUrl);

            // ดูค่าใน authorization header ว่ามีค่าส่งมา
            const header = req.headers.authorization || '';
            console.log('[AUTH] header:', header || '{empth}');

            const token = header.startsWith('Bearer ') ? header.slice(7) : null;
            if(!token){
                console.log('[AUTH] -> 401 Missing token');
                return res.status(401).json({success: false , message : 'Missing token'});
            }

            const payload = jwt.verify(token , process.env.JWT_SECRET);
            console.log('[AUTH] verified payload:' , payload);

            if(roles.length && !roles.includes(payload.role)){
                console.log('[AUTH] -> 403 Forbidden (role not allowed)' , roles , 'got:', payload.role);
                return res.status(403).json({success: false , message : 'Forbidden'})
            }

            req.user = payload;
            return next();
        }
        catch (e){
            console.log('[AUTH] ERROR:' , e.name , e.message);
            e.status = e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError' ? 401 : 500;
            next(e);
        }
    }
}

export default auth;
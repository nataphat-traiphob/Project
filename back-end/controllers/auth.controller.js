import db from '../db/knex';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

const login = async (req , res , next) => {
    try {
        const {email,password} = req.body || {};
        if(!email || !password)
            return res.status(400).json({success : false , message : "email and password required"});
    }

    const user = await db("users")
    .select("user_id","fname","lname","email","address","tel","role","password","is_active","create_at")
}
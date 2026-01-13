import db from '../db/knex.js'
import bcrypt from 'bcrypt'

/**
 * GET /api/users
 * 
 * - ดึงข้อมูล users ทั้งหมด
 */

export const getUsers = async (req , res , next) => {
    try {
        const rows = await db("users").select('user_id','fname','lname','email','address','tel','role','created_at')

        return res.json({success: true ,data: rows , total: data.length})
    }
    catch (e){
        next(e);
    }
}

/**
 * GET /api/users/:id
 * 
 * - ดึงข้อมูล user คนเดียวจาก id
 */

export const getUserById = async (req , res , next) => {
    try {
        const id = req.params.id ? req.params.id : null
        if(!id) return res.status(400).json({success : false , message : "User ID is required"})

        const row = await db("users")
            .select('user_id','fname','lname','email','address','tel','role','created_at') 
            .where({user_id : id}).first()
        
        if(!row){
            return res.status(404).json({success: false , message : "User not found"})
        }
        
        res.json({success : true , data : row})
    }
    catch(e){
        next(e)
    }
}

/**
 * POST /api/users
 * 
 * - เพิ่มข้อมูล user
 */

export const createUser = async (req , res , next) => {
    try {
        const {fname , lname , email , password_input , address , tel , role = 'user'} = req.body || {}

        if (!fname || !lname || !email || !password_input || !address || !tel){
            return res.status(400).json({success : false , message : "The required information is incomplete"})
        }

        const avaliable = await db("users").where({email}).first()

        if(avaliable){
            return res.json(409).json({success : false , message : "Email already exists"})
        }

        const password = await bcrypt.hash(password_input , 10)

        await db("users").insert({
            fname,
            lname,
            email,
            password,
            address,
            tel,
            role,
        })
        res.status(201).json({success : true , message : "User information added successfully"})
    }
    catch (e){
        next (e);
    }
}

/**
 * PUT /api/users/:id
 * 
 * - แก้ไขข้อมูล user จาก id
 */

export const editUser = async (req , res , next) => {
    try {
        const id = req.params.id ? req.params.id : null

        if(!id) return res.status(400).json({success : false , message : "User ID is required"})

        const { fname , lname , address , tel , role = 'user'} = req.body || {}

        await db("users").where({user_id : id}).update({fname , lname , address , tel , role})

        res.json({ success : true , message : 'User information updated successfully'})
    }
    catch (e) {
        next(e)
    }
}

/**
 * 
 */

export const deleteUser = async (req , res , next)
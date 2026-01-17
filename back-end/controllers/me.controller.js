import db from "../db/knex.js";
import bcrypt from "bcrypt";
import crypto from 'crypto';

/**
 * GET /api/me
 * 
 * - ดึงข้อมูลตนเอง
 */

export const getMe = async (req , res , next) => {
    try {
    const id = req.user.id;

    const row = await db("users")
      .select(
        "user_id",
        "fname",
        "lname",
        "email",
        "address",
        "tel",
        "created_at"
      )
      .where({ user_id: id, is_active: true })
      .first();

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/me
 *
 * - แก้ไขข้อมูลตนเอง
 */

export const updateMe = async (req, res, next) => {
  try {
    const id = req.user.id;

    const updateData = req.validated;
    
    if (!Object.keys(updateData).length) {
        return res
        .status(400)
        .json({ success: false, message: "No data to update" });
    }
    
    const updated = await db("users").where({ user_id: id , is_active : true}).update(updateData);

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      message: "User information updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/me
 * 
 * - ลบข้อมูลตนเอง
 */

export const deleteMe = async (req , res , next)=>{
    try{
        const id = req.user.id

        const randomPassword = crypto.randomBytes(32).toString('hex')
        const hashedPassword = await bcrypt.hash(randomPassword , 10)

        const deleted = await db('users').where({user_id : id , is_active : true}).update({
            is_active : false,
            email : `deleted_${id}_${Date.now()}@example.com`,
            fname : 'deleted',
            lname : 'user',
            tel : '-',
            address : '-',
            password : hashedPassword,
            role : 'user'
        })

        if(!deleted){
            return res.status(404).json({
                success:false , 
                message : 'User not found or already deactivated'
            })
        }

        await db('users').where({user_id : id}).increment('token_version' , 1)

        return res.json({
            success : true,
            message : 'Account deactivated successfully'
        })
    }
    catch(e){
        next(e)
    }
}


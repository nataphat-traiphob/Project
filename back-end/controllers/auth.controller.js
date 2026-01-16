import db from "../db/knex.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * POST /api/auth/login
 * 
 * เข้าสู่ระบบ
 */

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.validated;

    const user = await db("users")
      .select("user_id", "email", "role", "password")
      .where({ email })
      .first(); 

    if(!user){
        return res.status(401).json({success:false , message: "Invalid credentials"})
    }

    const ok = await bcrypt.compare(password , user.password);
    if(!ok){
        return res.status(401).json({ success:false , message:"Invalid credentials"})
    }

    delete user.password

    const token = jwt.sign(
        {id:user.user_id , role:user.role , token_version : user.token_version},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES || "2h"}
    )

    return res.json({
        success: true,
        token : token
    })
  } catch (e) {
    next(e)
  }
};

/**
 * POST /api/auth/register
 * 
 * - เพิ่มข้อมูลผู้ใช้ผ่านการลงทะเบียน
 */

export const Register = async (req, res, next) => {
  try {
    const {
      fname,
      lname,
      email,
      password_input,
      address,
      tel,
    } = req.validated;

    const avaliable = await db("users").where({ email }).first();

    if (avaliable) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    }

    const password = await bcrypt.hash(password_input, 10);

    await db("users").insert({
      fname,
      lname,
      email,
      password,
      address,
      tel,
      
    });
    res
      .status(201)
      .json({ success: true, message: "User information added successfully" });
  } catch (e) {
    next(e);
  }
};
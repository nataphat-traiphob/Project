import db from "../db/knex.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password){
      return res
        .status(400)
        .json({ success: false, message: "email and password required" });
    }

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
        {id:user.user_id , role:user.role},
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


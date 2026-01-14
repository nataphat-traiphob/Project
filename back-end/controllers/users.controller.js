import db from "../db/knex.js";
import bcrypt from "bcrypt";

/**
 * GET /api/users
 *
 * - ดึงข้อมูล users ทั้งหมด
 */

export const getUsers = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      order = "desc",
      search = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 10) limit = 10;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    const allowedSortFields = [
      "user_id",
      "fname",
      "lname",
      "email",
      "role",
      "created_at",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "created_at";
    }

    order = order === "asc" ? "asc" : "desc";

    const baseQuery = db("users")
      .where({ is_active: true })
      .modify((q) => {
        if (search) {
          q.andWhere((builder) => {
            builder
              .where("fname", "like", `%${search}%`)
              .orWhere("lname", "like", `%${search}%`)
              .orWhere("email", "like", `%${search}%`);
          });
        }
      });

    const data = await baseQuery
      .clone()
      .select(
        "user_id",
        "fname",
        "lname",
        "email",
        "address",
        "tel",
        "role",
        "created_at"
      )
      .orderBy(sortBy, order)
      .limit(limit)
      .offset(offset);

    const [{ total }] = await baseQuery.clone().count("user_id as total");

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    next(e);
  }
};

/**
 * GET /api/users/:id
 *
 * - ดึงข้อมูล user คนเดียวจาก id
 */

export const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const row = await db("users")
      .select(
        "user_id",
        "fname",
        "lname",
        "email",
        "address",
        "tel",
        "role",
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
};

/**
 * POST /api/users
 *
 * - เพิ่มข้อมูล user
 */

export const createUser = async (req, res, next) => {
  try {
    const {
      fname,
      lname,
      email,
      password_input,
      address,
      tel,
      role = "user",
    } = req.body || {};

    if (!fname || !lname || !email || !password_input || !address || !tel) {
      return res.status(400).json({
        success: false,
        message: "The required information is incomplete",
      });
    }

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
      role,
    });
    res
      .status(201)
      .json({ success: true, message: "User information added successfully" });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/users/:id
 *
 * - แก้ไขข้อมูล user จาก id
 */

export const editUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const { fname, lname, address, tel, role = "user" } = req.body || {};

    const updateData = {};

    if (fname !== undefined) updateData.fname = fname;
    if (lname !== undefined) updateData.lname = lname;
    if (address !== undefined) updateData.address = address;
    if (tel !== undefined) updateData.tel = tel;
    if (role !== undefined) updateData.role = role;

    const updated = await db("users").where({ user_id: id }).update(updateData);

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
 *
 */

export const deleteUser = async (req, res, next) => {
  try {
    const id = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });

    const deleted = await db("users")
      .where({ user_id: id })
      .update({ is_active: false });

    if (!deleted) {
      res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User information deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

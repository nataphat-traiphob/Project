import db from "../db/knex.js";
import {TransactionError} from '../errors/TransactionError.js'

/**
 * GET /api/discount
 *
 * ดึงข้อมูล Product discount ทั้งหมด
 */

export const getProductDiscounts = async (req, res, next) => {
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

    const allowedSortFields = {
      dis_id: "d.dis_id",
      dis_type: "d.dis_type",
      dis_value: "d.dis_value",
      pd_id: "d.pd_id",
      pd_name: "p.pd_name",
      start_at: "d.start_at",
      end_at: "d.end_at",
      is_active: "d.is_active",
      created_at: "d.created_at",
      updated_at: "d.updated_at",
    };

    if (!allowedSortFields[sortBy]) {
      sortBy = "created_at";
    }

    order = order === "asc" ? "asc" : "desc";

    const baseQuery = db("product_discount as d")
      .join("product as p", "d.pd_id", "p.pd_id")
      .where({ "d.is_active": true })
      .modify((q) => {
        if (search) {
          q.andWhere((builder) => {
            builder.where("p.pd_name", "like", `%${search}%`);
          });
        }
      });

    const data = await baseQuery
      .clone()
      .select(
        "d.dis_id",
        "d.dis_type",
        "d.dis_value",
        "d.pd_id",
        "p.pd_name",
        "d.start_at",
        "d.end_at",
        "d.is_active",
        "d.created_at",
        "d.updated_at",
      )
      .orderBy(allowedSortFields[sortBy], order)
      .limit(limit)
      .offset(offset);

    const [{ total }] = await baseQuery.clone().count("d.dis_id as total");

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
 * GET /api/discount/:id
 *
 * - ดึงข้อมูล product ตัวเดียวจาก id
 */

export const getProductDiscountById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product discount ID is required" });

    const row = await db("product_discount as d")
      .select(
        "d.dis_id",
        "d.dis_type",
        "d.dis_value",
        "d.pd_id",
        "p.pd_name",
        "d.start_at",
        "d.end_at",
        "d.is_active",
        "d.created_at",
        "d.updated_at",
      )
      .join("product as p", "d.pd_id", "p.pd_id")
      .where({ "d.dis_id": id, "d.is_active": true })
      .first();

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Product discount not found" });
    }

    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/discount
 *
 * - เพิ่มข้อมูล product discount
 */

export const createProductDiscount = async (req, res, next) => {
  try {
    const { pd_id, dis_type, dis_value, start_at, end_at } = req.validated;

    if (new Date(start_at) > new Date(end_at)) {
      return res
        .status(400)
        .json({ success: false, message: "The time period is not correct" });
    }

    await db.transaction(async trx => {
      await trx("product").where({pd_id}).forUpdate()
      
      const overlap = await trx("product_discount")
      .where({ pd_id, is_active: true })
      .andWhere(function () {
        this.where("start_at", "<", updateData.end_at).andWhere(
          "end_at",
          ">",
          updateData.start_at,
        );
      })
      .first();
      
      if (overlap) {
        throw new TransactionError("Overlapping time periods" , 400)
      }
      
      await trx("product_discount").insert({
        pd_id,
        dis_type,
        dis_value,
        start_at,
        end_at,
      });
    })

    res
      .status(201)
      .json({
        success: true,
        message: "Product discount information added successfully",
      });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/discount/:id
 *
 * - แก้ไขข้อมูล product discount จาก id
 */

export const updateProductDiscount = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updateData = req.validated;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product discount ID is required" });

    if (!Object.keys(updateData).length) {
      return res
        .status(400)
        .json({ success: false, message: "No data to update" });
    }

    if (new Date(updateData.start_at) > new Date(updateData.end_at)) {
      return res
        .status(400)
        .json({ success: false, message: "The time period is not correct" });
    }

    await db.transaction(async trx => {
      await trx("product").where({pd_id}).forUpdate()
      
      const overlap = await trx("product_discount")
      .where({ pd_id, is_active: true })
      .andWhere(function () {
        this.where("start_at", "<", updateData.end_at).andWhere(
          "end_at",
          ">",
          updateData.start_at,
        );
      })
      .first();
      
      if (overlap) {
        throw new TransactionError("Overlapping time periods" , 400)
      }
      const updated = await trx("product_discount")
        .where({ dis_id: id, is_active: true })
        .update(updateData);
  
      if (!updated) {
        throw new TransactionError("Product discount not found" , 404)
      }
    })
    res.json({
      success: true,
      message: "Product discount information updated successfully",
    });
      
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/discount/:id
 *
 * - ลบข้อมูล product discount จาก id
 */

export const deleteProductDiscount = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product discount ID is required" });

    const deleted = await db("product_discount")
      .where({ dis_id: id })
      .update({ is_active: false });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product discount not found" });
    }

    res.json({
      success: true,
      message: "Product discount information deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

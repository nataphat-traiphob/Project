import db from "../db/knex.js";

/**
 * GET /api/orders
 *
 * ดึงข้อมูล orders ทั้งหมด
 */

export const getOrders = async (req, res, next) => {
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
      order_id: "o.order_id",
      user_id: "u.user_id",
      fname: "u.fname",
      total_amount: "o.total_amount",
      status: "o.status",
      created_at: "o.created_at",
      updated_at: "o.updated_at",
    };

    if (!allowedSortFields[sortBy]) {
      sortBy = "created_at";
    }

    order = order === "asc" ? "asc" : "desc";

    const baseQuery = db("orders as o")
      .join("users as u", "o.user_id", "u.user_id")
      .whereIn("status", ["pending", "paid"])
      .modify((q) => {
        if (search) {
          q.andWhere((builder) => {
            builder.where("u.fname", "like", `%${search}%`);
          });
        }
      });

    const data = await baseQuery
      .clone()
      .select(
        "o.order_id",
        "u.user_id",
        "u.fname",
        "o.total_amount",
        "o.status",
        "o.created_at",
        "o.updated_at",
      )
      .orderBy(allowedSortFields[sortBy], order)
      .limit(limit)
      .offset(offset);

    const [{ total }] = await baseQuery.clone().count("o.order_id as total");

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
 * GET /api/orders/:id
 *
 * - ดึงข้อมูล order ตัวเดียวจาก id
 */

export const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });

    const row = await db("orders as o")
      .select(
        "o.order_id",
        "u.user_id",
        "u.fname",
        "o.total_amount",
        "o.status",
        "o.created_at",
        "o.updated_at",
      )
      .join("users as u", "o.user_id", "u.user_id")
      .where({ "o.order_id": id })
      .first();

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/orders
 *
 * - เพิ่มข้อมูล order
 */

export const createOrder = async (req, res, next) => {
  try {
    const { user_id } = req.validated;

    if (new Date(start_at) > new Date(end_at)) {
      return res
        .status(400)
        .json({ success: false, message: "The time period is not correct" });
    }

    const overlap = await db("product_discount")
      .where({ pd_id, is_active: true })
      .andWhere(function () {
        this.where("start_at", "<", end_at).andWhere("end_at", ">", start_at);
      })
      .first();

    if (overlap) {
      return res
        .status(400)
        .json({ success: false, message: "Overlapping the time periods" });
    }

    await db("product_discount").insert({
      pd_id,
      dis_type,
      dis_value,
      start_at,
      end_at,
    });
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

    const overlap = await db("product_discount")
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
      return res
        .status(400)
        .json({ success: false, message: "Overlapping the time periods" });
    }

    const updated = await db("product_discount")
      .where({ dis_id: id, is_active: true })
      .update(updateData);

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Product discount not found" });
    }
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

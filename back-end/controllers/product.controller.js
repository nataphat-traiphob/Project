import db from "../db/knex.js";
import { archiveImage } from "../utils/image/archiveImage.js";
import { buildImagePath } from "../utils/image/buildImagePath.js";
import { deleteImage } from "../utils/image/deleteImage.js";

/**
 * GET /api/product
 * 
 * ดึงข้อมูล Product ทั้งหมด
 */

export const getProducts = async (req, res, next) => {
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
      "pd_id",
      "pd_name",
      "pd_price",
      "pd_detail",
      "pd_category",
      "pd_img",
      "is_active",
      "created_at",
      "updated_at",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "created_at";
    }

    order = order === "asc" ? "asc" : "desc";

    const baseQuery = db("product")
      .where({is_active : true})
      .modify((q) => {
        if (search) {
          q.andWhere((builder) => {
            builder
              .where("pd_name", "like", `%${search}%`)
              .orWhere("pd_detail", "like", `%${search}%`)
              .orWhere("pd_category", "like", `%${search}%`);
          });
        }
      });

    const data = await baseQuery
      .clone()
      .select(
        "pd_id",
        "pd_name",
        "pd_price",
        "pd_detail",
        "pd_category",
        "pd_img",
        "is_active",
        "created_at",
        "updated_at",
      )
      .orderBy(sortBy, order)
      .limit(limit)
      .offset(offset);
    
    data.forEach(p => {
        p.pd_img = p.pd_img ? buildImagePath("product" , "active" ,p.pd_img) : null
    });

    const [{ total }] = await baseQuery.clone().count("pd_id as total");

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
 * GET /api/product/:id
 *
 * - ดึงข้อมูล product ตัวเดียวจาก id
 */

export const getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });

    const row = await db("product")
      .select(
        "pd_id",
        "pd_name",
        "pd_price",
        "pd_detail",
        "pd_category",
        "pd_img",
        "is_active",
        "created_at",
        "updated_at",
      )
      .where({ pd_id: id , is_active : true})
      .first();

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    row.pd_img = row.pd_img ? buildImagePath("product" , "active" ,row.pd_img) : null

    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/product
 *
 * - เพิ่มข้อมูล product
 */

export const createProduct = async (req, res, next) => {
  try {
    const {
      pd_name,
      pd_price,
      pd_detail,
      pd_category,
    } = req.validated;

    const pd_img = req.file ? req.file.filename : null

    const avaliable = await db("product").where({ pd_name }).first();

    if (avaliable) {
      return res
        .status(409)
        .json({ success: false, message: "Product already exists" });
    }


    await db("product").insert({
      pd_name,
      pd_price,
      pd_detail,
      pd_category,
      pd_img,
    });
    res
      .status(201)
      .json({ success: true, message: "Product information added successfully" });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/product/:id
 *
 * - แก้ไขข้อมูล product จาก id
 */

export const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updateData = req.validated;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });


    if (!Object.keys(updateData).length) {
      return res
        .status(400)
        .json({ success: false, message: "No data to update" });
    }

    const oldProduct = await db('product').select("pd_img").where({pd_id : id , is_active : true}).first()

    if(!oldProduct){
        return res.status(404).json({success:false , message:'Product not found'})
    }

    if(req.file){
        deleteImage("product" , "active" , oldProduct.pd_img);
        updateData.pd_img = req.file.filename
    }

    if(updateData.pd_name){
        const avaliable = await db("product").where({ pd_name : updateData.pd_name}).andWhereNot({pd_id : id}).first();
        
        if (avaliable) {
          return res
            .status(409)
            .json({ success: false, message: "Product already exists" });
        }
    }



    const updated = await db("product")
      .where({ pd_id: id, is_active: true })
      .update(updateData);

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      message: "Product information updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/product/:id
 *
 * - ลบข้อมูล product จาก id
 */

export const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });

    const deleted = await db("product")
      .where({ pd_id: id })
      .update({is_active: false,});

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const oldProduct = await db('product').select("pd_img").where({pd_id : id , is_active : true}).first()

    archiveImage("product" , oldProduct.pd_img)

    res.json({
      success: true,
      message: "Product information deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

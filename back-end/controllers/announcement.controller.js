import db from "../db/knex.js";
import { archiveImage } from "../utils/image/archiveImage.js";
import { buildImagePath } from "../utils/image/buildImagePath.js";
import { deleteImage } from "../utils/image/deleteImage.js";

/**
 * GET /api/announcement
 * 
 * ดึงข้อมูล announcement ทั้งหมด
 */

export const getAnnouncements = async (req, res, next) => {
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
      "annc_id",
      "title",
      "description",
      "annc_img",
      "is_active",
      "created_at",
      "updated_at",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "created_at";
    }

    order = order === "asc" ? "asc" : "desc";

    const baseQuery = db("announcement")
      .where({is_active : true})
      .modify((q) => {
        if (search) {
          q.andWhere((builder) => {
            builder
              .where("title", "like", `%${search}%`)
              .orWhere("description", "like", `%${search}%`)
          });
        }
      });

    const data = await baseQuery
      .clone()
      .select(
        "annc_id",
        "title",
        "description",
        "annc_img",
        "is_active",
        "created_at",
        "updated_at",
      )
      .orderBy(sortBy, order)
      .limit(limit)
      .offset(offset);
    
    data.forEach(a => {
        a.annc_img = a.annc_img ? buildImagePath("announcement" , "active" ,a.annc_img) : null
    });

    const [{ total }] = await baseQuery.clone().count("annc_id as total");

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
 * GET /api/announcement/:id
 *
 * - ดึงข้อมูล announcement ตัวเดียวจาก id
 */

export const getAnnouncementById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Announcement ID is required" });

    const row = await db("announcement")
      .select(
        "annc_id",
        "title",
        "description",
        "start_at",
        "end_at",
        "annc_img",
        "is_active",
        "created_at",
        "updated_at",
      )
      .where({ annc_id: id , is_active : true})
      .first();

    if (!row) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    row.annc_img = row.annc_img ? buildImagePath("announcement" , "active" ,row.annc_img) : null

    res.json({ success: true, data: row });
  } catch (e) {
    next(e);
  }
};

/**
 * POST /api/announcement
 *
 * - เพิ่มข้อมูล announcement
 */

export const createAnnouncement = async (req, res, next) => {
  try {
    const {
      title,
      description,
      start_at,
      end_at
    } = req.validated;

    const annc_img = req.file ? req.file.filename : null

    await db("announcement").insert({
      title,
      description,
      annc_img,
      start_at,
      end_at
    });
    res
      .status(201)
      .json({ success: true, message: "Announcement information added successfully" });
  } catch (e) {
    next(e);
  }
};

/**
 * PUT /api/announcement/:id
 *
 * - แก้ไขข้อมูล announcement จาก id
 */

export const updateAnnouncement = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updateData = req.validated;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Announcement ID is required" });


    if (!Object.keys(updateData).length) {
      return res
        .status(400)
        .json({ success: false, message: "No data to update" });
    }

    const oldAnnouncement = await db('announcement').select("annc_img").where({annc_id : id , is_active : true}).first()

    if(!oldAnnouncement){
        return res.status(404).json({success:false , message:'Announcement not found'})
    }

    if(req.file){
        deleteImage("announcement" , "active" , oldAnnouncement.annc_img);
        updateData.annc_img = req.file.filename
    }



    const updated = await db("announcement")
      .where({ annc_id: id, is_active: true })
      .update(updateData);

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }
    res.json({
      success: true,
      message: "Announcement information updated successfully",
    });
  } catch (e) {
    next(e);
  }
};

/**
 * DELETE /api/announcement/:id
 *
 * - ลบข้อมูล announcement จาก id
 */

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Announcement ID is required" });

    const deleted = await db("announcement")
      .where({ annc_id: id })
      .update({is_active: false,});

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    const oldAnnouncement = await db('announcement').select("annc_img").where({pd_id : id , is_active : true}).first()

    archiveImage("announcement" , oldAnnouncement.pd_img)

    res.json({
      success: true,
      message: "Announcement information deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

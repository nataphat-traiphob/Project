import db from "../db/knex.js";
import { TransactionError } from "../errors/TransactionError.js";
import { recalcOrderTotal } from "../services/order.service.js";

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
 * - ดึงข้อมูล order_items จาก id
 */

export const getOrderById = async (req, res, next) => {
  try {
    const order_id = req.params.id;
    const {role , id} = req.user
    if (!order_id)
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
      .where({ "o.order_id": order_id })
      .first();

    if(row.user_id !== id && role !== 'admin'){
      return res.status(403).json({success: false , message : 'Forbidden'})
    }

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
 * - เพิ่มข้อมูล order และ order_items
 */

export const createOrder = async (req, res, next) => {
  const trx = await db.transaction();

  try {
    const {use_default_address , address , items} = req.validated;
    const {id} = req.user.id

    if(!items || !items.length){
      throw new TransactionError("Order must have at least one item",400,"EMPTY_ORDER")
    }

    let finalAddress


    if(use_default_address){
      const user = await trx("users").select('address').where({user_id : id}).first()

      if(!user || !user.address){
        throw new TransactionError("User has no default address",400,"NO_DEFAULT_ADDRESS")
      }

      finalAddress = user.address
    }

    else{
      finalAddress = address
    }

    const orderItems = items.map(item => ({
      ...item,
      total: item.price * item.quantity
    }))

    const total_amount = orderItems.reduce((sum , item) => sum + item.total , 0)

    const [order_id] = await trx("orders").insert({
      user_id : id,
      address : finalAddress,
      total_amount,
    });

    const orderItemsWithFK = orderItems.map(item => ({
      order_id,
      pd_id,
      quantity : item.quantity,
      price : item.price,
      total:item.total
    }))

    await trx("order_items").insert(orderItemsWithFK)

    await trx.commit()

    res
      .status(201)
      .json({
        success: true,
        message: "Order created successfully",
      });
  } catch (e) {
    await trx.rollback()
    next(e);
  }
};

/**
 * PUT /api/order/:id
 *
 * - แก้ไขข้อมูล order และ order_items จาก id
 */

export const updateOrder = async (req, res, next) => {
  const trx = await db.transaction()
  try {
    const {role , id} = req.user
    const order_id = req.params.id;
    const updateData = req.validated;

    if (!order_id)
      throw new TransactionError("Order ID is required" , 400)

    if (!Object.keys(updateData).length) {
      throw new TransactionError("No data to update" , 400)
    }

    const row = await trx("orders").select('user_id').where(order_id).first()

    if(row.user_id !== id && role !== 'admin'){
      throw new TransactionError('Forbidden' , 403)
    }

    const updated = await trx("orders")
      .where({ order_id, status: 'pending' })
      .update(updateData.address);

    await trx("order_items").where({order_id}).delete()

    const orderItems = updateData.items.map(item => ({
      ...item,
      total: item.price * item.quantity
    }))

    const orderItemsWithFK = orderItems.map(item => ({
      order_id,
      pd_id,
      quantity : item.quantity,
      price : item.price,
      total:item.total
    }))

    await trx("order_items").insert(orderItemsWithFK)

    await recalcOrderTotal(trx , order_id)

    if (!updated) {
      throw new TransactionError("Order not found" , 404)
    }

    await trx.commit()

    res.json({
      success: true, 
      message: "Order updated successfully",
    });
  } catch (e) {
    await trx.rollback()
    next(e);
  }
};

/**
 * DELETE /api/orders/:id
 *
 * - ลบข้อมูล order(soft delete) และ order_items(hard delete) จาก id
 */

export const deleteProductDiscount = async (req, res, next) => {
  try {
    const order_id = req.params.id;
    const id = req.user.id
    if (!order_id)
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });

    const currentOrder = await db("orders").select("order_id,status").where(order_id).first()

    if(!currentOrder){
      return res.status(404).json({success:false , message: 'Order ID is not valid'})
    }

    if(currentOrder.order_id !== id && role !== 'admin'){
      return res.status(403).json({success : false , message:'Forbidden'})
    }

    if(currentOrder.status !== 'pending'){
      return res.status(403).json({success:false , message:"This order cannot be cancelled at its current status"})
    }

    const deletedOrder = await db("order_id")
      .where({ order_id , status : 'pending'})
      .update({status: 'cancelled'});

    const deleteItems = await db("order_items").where(order_id).delete()

    if (!deletedOrder || !deleteItems) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};


/**
 * PUT /api/orders/status/:id
 * 
 * - แก้ไขสถานะของ orders 
 *    pending -> paid -> shipped
 */

export const UpdateOrderStatus = async (req , res , next) => {
  try {
    const order_id = req.params.id
    const {role , id} = req.user
    const currentOrder = db("orders").select("user_id,status").where(order_id).first()

    if(!currentOrder){
      return res.status(404).json({success:false , message: 'Order ID is not valid'})
    }

    if(currentOrder.order_id !== id && role !== 'admin'){
      return res.status(403).json({success : false , message:'Forbidden'})
    }
    let message 
    let updateStatus

    if(currentOrder.status === 'pending' && currentOrder.user_id === id){
      updateStatus = 'paid'
      message = 'Payment completed (mock)'
    }
    else if (currentOrder.status === 'paid' && role ==='admin'){
      updateStatus = 'shipped'
      message = 'Already shipped'
    }
    else{
      return res.status(403).json({success:false , message:"This order cannot be cancelled at its current status"})
    }

    const update = await db("orders").where(order_id).update({status : updateStatus})

    if(!update){
      return res.status(404).json({success:false , message : 'Order not found'})
    }

    res.json({
      success:true,
      message
    })

    
  }
  catch(e){
    next(e);
  }
}
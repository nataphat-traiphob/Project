import db from "../db/knex";

export const recalcOrderTotal = async (trx , order_id) => {
    const [{sum}] = await trx("order_items").where(order_id).sum("total as sum")

    await trx("orders").where(order_id).update({total_amount : sum || 0})
}

export const ORDER_FLOW = {
  pending: "paid",
  paid: "shipped",
  shipped: null
};

export const getNextOrderState = (currentStatus) => {
  const next = ORDER_FLOW[currentStatus];

  if (!next) {
    return null;
  }

  return next;
};

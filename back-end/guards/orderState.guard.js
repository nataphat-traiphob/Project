import { TransactionError } from "../errors/TransactionError.js";

const ROLE_CAN_ADVANCE = {
  pending: ["user"],      // user จ่ายเงิน
  paid: ["admin"],        // admin ส่งของ
};

export const canAdvanceOrderState = ({
  currentStatus,
  role
}) => {
  const allowedRoles = ROLE_CAN_ADVANCE[currentStatus] || [];

  if (!allowedRoles.includes(role)) {
    throw new TransactionError(
      `Role ${role} cannot advance order from ${currentStatus}`,
      403,
      "ORDER_STATE_FORBIDDEN"
    );
  }

  return true;
};


export const canEditOrder = (status) => {
  if (status !== "pending") {
    throw new TransactionError(
      "Order cannot be modified",
      400,
      "ORDER_LOCKED"
    );
  }
};

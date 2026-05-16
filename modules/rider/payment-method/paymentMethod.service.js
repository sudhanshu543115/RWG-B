import PaymentMethod
from "../../../models/rider/PaymentMethod.js";

export const addPaymentMethodService =
async (riderId, payload) => {

   return await PaymentMethod.create({
      riderId,
      ...payload
   });
};

export const getPaymentMethodsService =
async (riderId) => {

   return await PaymentMethod.find({
      riderId
   }).sort({ createdAt: -1 });
};

export const deletePaymentMethodService =
async (id) => {

   return await PaymentMethod.findByIdAndDelete(id);
};
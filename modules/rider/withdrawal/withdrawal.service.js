import Rider from "../../../models/rider/Rider.js";
import Payout from "../../../models/rider/payout.js";
import PaymentMethod from "../../../models/rider/PaymentMethod.js";

export const createWithdrawalService = async (
   riderId,
   payload
) => {

   const {
      amount,
      paymentMethodId
   } = payload;

   const rider = await Rider.findById(riderId);

   if (!rider) {
      throw new Error("Rider not found");
   }

   if (amount < 100) {
      throw new Error(
         "Minimum withdrawal is ₹100"
      );
   }

   const availableBalance = rider.walletBalance - rider.pendingWithdrawal;
   if (amount > availableBalance) {
      throw new Error(
         "Insufficient wallet balance"
      );
   }

   const paymentMethod =
      await PaymentMethod.findById(
         paymentMethodId
      );

   if (!paymentMethod) {
      throw new Error(
         "Payment method not found"
      );
   }

   const payout = await Payout.create({

      riderId,

      amount,

      paymentMethodId,

      snapshot: paymentMethod,

      status: "pending"
   });

   rider.pendingWithdrawal += amount;

   await rider.save();

   return payout;
};
export const getMyWithdrawalsService = async (
   riderId
) => {

   return await Payout.find({
      riderId
   })
   .populate("paymentMethodId")
   .sort({ createdAt: -1 });

};
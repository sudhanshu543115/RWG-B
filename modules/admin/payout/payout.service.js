import Payout from "../../../models/rider/payout.js";
import Rider from "../../../models/rider/Rider.js";

export const getAllPayoutsService = async () => {

   return await Payout.find()
      .populate("riderId", "name phone email")
      .populate("paymentMethodId")
      .sort({ createdAt: -1 });

};

export const processPayoutService = async (
   payoutId
) => {

   const payout = await Payout.findById(
      payoutId
   );

   if (!payout) {
      throw new Error("Payout not found");
   }

   if (payout.status !== "pending") {
      throw new Error(
         "Payout already processed"
      );
   }

   payout.status = "completed";

   await payout.save();

   // reduce pending withdrawal
   await Rider.findByIdAndUpdate(
      payout.riderId,
      {
         $inc: {
            pendingWithdrawal: -payout.amount
         }
      }
   );

   return payout;
};
import Payout from "../../../models/rider/payout.js";
import Rider from "../../../models/rider/Rider.js";
import { notifyRiderPayoutProcessed, notifyRiderPayoutRejected } from "../../../core/socket.events.js";

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

   // reduce pending withdrawal AND wallet balance (since we didn't reduce wallet balance on request)
   await Rider.findByIdAndUpdate(
      payout.riderId,
      {
         $inc: {
            pendingWithdrawal: -payout.amount,
            walletBalance: -payout.amount
         }
      }
   );

   notifyRiderPayoutProcessed(payout.riderId, payout.amount);

   return payout;
};

export const rejectPayoutService = async (
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

   payout.status = "rejected";

   await payout.save();

   // reduce only pending withdrawal, wallet balance stays intact (so it's available again)
   await Rider.findByIdAndUpdate(
      payout.riderId,
      {
         $inc: {
            pendingWithdrawal: -payout.amount
         }
      }
   );

   notifyRiderPayoutRejected(payout.riderId, payout.amount);

   return payout;
};
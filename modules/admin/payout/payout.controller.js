import {
   getAllPayoutsService,
   processPayoutService,
   rejectPayoutService
} from "./payout.service.js";

export const getAllPayouts = async (req, res) => {
   try {

      const data = await getAllPayoutsService();

      res.status(200).json({
         success: true,
         data
      });

   } catch (error) {
      res.status(400).json({
         success: false,
         message: error.message
      });
   }
};

export const processPayout = async (req, res) => {

   try {

      const data = await processPayoutService(
         req.params.id
      );

      res.status(200).json({
         success: true,
         message: "Payout processed successfully",
         data
      });

   } catch (error) {

      res.status(400).json({
         success: false,
         message: error.message
      });
   }
};

export const rejectPayout = async (req, res) => {
   try {
      const data = await rejectPayoutService(req.params.id);

      res.status(200).json({
         success: true,
         message: "Payout rejected successfully",
         data
      });
   } catch (error) {
      res.status(400).json({
         success: false,
         message: error.message
      });
   }
};
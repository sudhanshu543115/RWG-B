import {
   createWithdrawalService,
   getMyWithdrawalsService
} from "./withdrawal.service.js";

export const createWithdrawal = async (req, res) => {
   try {

      const data = await createWithdrawalService(
         req.user._id,
         req.body
      );

      res.status(201).json({
         success: true,
         message: "Withdrawal request created",
         data
      });

   } catch (error) {
      res.status(400).json({
         success: false,
         message: error.message
      });
   }
};

export const getMyWithdrawals = async (req, res) => {

   try {

      const data = await getMyWithdrawalsService(req.user._id);

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
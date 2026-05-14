import {
   addPaymentMethodService,
   getPaymentMethodsService,
   deletePaymentMethodService
} from "./paymentMethod.service.js";

export const addPaymentMethod = async (
   req,
   res
) => {

   try {

      const data =
         await addPaymentMethodService(
            req.user._id,
            req.body
         );

      res.status(201).json({
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

export const getPaymentMethods = async (
   req,
   res
) => {

   try {

      const data =
         await getPaymentMethodsService(
            req.user._id
         );

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

export const deletePaymentMethod = async (
   req,
   res
) => {

   try {

      await deletePaymentMethodService(
         req.params.id
      );

      res.status(200).json({
         success: true,
         message: "Deleted"
      });

   } catch (error) {

      res.status(400).json({
         success: false,
         message: error.message
      });
   }
};
import {
    getAllBookings,
    getBookingById,
    // updateBookingStatus,
    deleteBooking,
    assignRiderToBooking,
    autoAssignRiderService,
    getSettingsService,
    toggleAutoAssignService

} from "./bookings.service.js";
import { notifyTouristRiderAssigned } from "../../../core/socket.events.js";



export const getAllBookingsController = async (req, res) => {
    try {
        const bookings = await getAllBookings();
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getBookingByIdController = async (req, res) => {
    try {
        const booking = await getBookingById(req.params.id);
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// export const updateBookingStatusController = async (req, res) => {
//     try {
//         const booking = await updateBookingStatus(req.params.id, req.body.status);
//         res.status(200).json({ success: true, data: booking });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }

export const deleteBookingController = async (req, res) => {
    try {
        const booking = await deleteBooking(req.params.id);
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const assignRiderToBookingController = async (req, res) => {
    try {
        const { riderId } = req.body;
        console.log("🚀 ASSIGN RIDER API CALLED:", { bookingId: req.params.id, riderId });

        // Check if rider is verified before assigning
        const Rider = (await import("../../../models/rider/Rider.js")).default;
        const rider = await Rider.findById(riderId);

        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found." });
        }

        if (!rider.isVerified || rider.verificationStatus !== "approved") {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot assign this rider. Profile is not verified/approved yet." 
            });
        }

        // Assign rider and auto-confirm booking
        console.log("📞 CALLING assignRiderToBooking service...");
        const booking = await assignRiderToBooking(req.params.id, riderId);
        console.log("✅ assignRiderToBooking completed. Booking:", booking._id);

        res.status(200).json({ success: true, message: "Rider assigned & booking confirmed.", data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}





export const autoAssignRiderController = async (req, res) => {
    try {
        console.log("🚀 AUTO ASSIGN API CALLED:", { bookingId: req.params.id });
        const { booking, assignedRider } = await autoAssignRiderService(req.params.id);
        
        // Notify tourist about the assignment
        console.log("🎯 CALLING notifyTouristRiderAssigned from autoAssignRiderController...");
        notifyTouristRiderAssigned(booking, assignedRider);
        console.log("✅ Notification sent in autoAssignRiderController");
        
        res.status(200).json({ 
            success: true, 
            message: `Auto-assigned to ${assignedRider.name} (${assignedRider.city})`,
            data: booking 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



export const getSettings = async (req, res) => {
    try {
        const settings = await getSettingsService();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const toggleAutoAssign = async (req, res) => {
    try {
        const settings = await toggleAutoAssignService();
        res.status(200).json({ 
            success: true, 
            message: `Auto-assign is now ${settings.autoAssign ? "ON" : "OFF"}`,
            data: settings 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


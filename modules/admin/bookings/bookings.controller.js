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
        const booking = await assignRiderToBooking(req.params.id, riderId);
        await updateBookingStatus(req.params.id, "confirmed");

        res.status(200).json({ success: true, message: "Rider assigned & booking confirmed.", data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}





export const autoAssignRiderController = async (req, res) => {
    try {
        const { booking, assignedRider } = await autoAssignRiderService(req.params.id);
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


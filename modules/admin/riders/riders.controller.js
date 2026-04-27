import { getAllRidersService, updateRiderStatusService, getPendingRidersService, deleteRiderService } from "./riders.service.js";


export const getAllRiders = async (req, res) => {
    try {
        const { status } = req.query;
        const riders = await getAllRidersService(status);
        res.status(200).json({ success: true, data: riders });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateRiderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const rider = await updateRiderStatusService(id, status);
        res.status(200).json({ success: true, data: rider });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



export const getPendingRiders = async (req, res) => {
    try {
        const riders = await getPendingRidersService();
        res.status(200).json({ success: true, data: riders });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const deleteRider = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteRiderService(id);
        res.status(200).json({ success: true, message: "Rider deleted successfully." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


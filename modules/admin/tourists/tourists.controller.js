import {
    getAllTouristsService,
    getPendingTouristsService,
    updateTouristService,
    deleteTouristService,
    getTouristByIdService
} from "./tourists.service.js";

// GET ALL
export const getAllTourists = async (req, res) => {
    try {
        const tourists = await getAllTouristsService(req.query);
        res.status(200).json({ success: true, data: tourists });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET PENDING (profile not completed)
export const getPendingTourists = async (req, res) => {
    try {
        const tourists = await getPendingTouristsService();
        res.status(200).json({ success: true, data: tourists });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET BY ID
export const getTouristById = async (req, res) => {
    try {
        const tourist = await getTouristByIdService(req.params.id);
        res.status(200).json({ success: true, data: tourist });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// UPDATE
export const updateTourist = async (req, res) => {
    try {
        const tourist = await updateTouristService(req.params.id, req.body);
        res.status(200).json({ success: true, data: tourist });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE
export const deleteTourist = async (req, res) => {
    try {
        await deleteTouristService(req.params.id);
        res.status(200).json({ success: true, message: "Tourist deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
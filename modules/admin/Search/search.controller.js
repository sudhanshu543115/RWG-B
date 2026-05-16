import { searchService } from "./search.service.js";

export const handleSearch = async (req, res) => {
    try {
        const { q } = req.query; // Get search term from ?q=...
        if (!q) return res.status(200).json({ success: true, data: { guides: [], tours: [] } });

        const results = await searchService(q);
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

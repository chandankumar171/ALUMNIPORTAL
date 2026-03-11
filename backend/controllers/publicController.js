const User = require("../models/User");
const Post = require("../models/Post");

// Get public statistics
exports.getStats = async (req, res) => {
    try {
        const totalAlumni = await User.countDocuments({ isAdmin: false });
        const totalJobs   = await Post.countDocuments();

        res.json({
            totalAlumni,
            totalJobs
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Error fetching statistics" });
    }
};

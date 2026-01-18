const Wholesale = require('./wholesale.model');

exports.createWholesale = async (req, res) => {
    try {
        const { name, surname, email, phone, comment, file } = req.body;

        const wholesale = new Wholesale({
            name,
            surname,
            email,
            phone,
            comment,
            file,
            status: "new"
        });

        await wholesale.save();

        res.status(201).json({
            success: true,
            message: "Wholesale application submitted successfully",
            data: wholesale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllWholesales = async (req, res) => {
    try {
        const applications = await Wholesale.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateWholesaleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const wholesale = await Wholesale.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!wholesale) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        res.status(200).json({
            success: true,
            data: wholesale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

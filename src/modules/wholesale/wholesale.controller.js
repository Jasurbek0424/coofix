const Wholesale = require('./wholesale.model');
const uploadToCloudinary = require('../../core/utils/uploadToCloudinary');

exports.createWholesale = async (req, res) => {
    try {
        const { name, surname, email, phone, comment } = req.body;
        let fileUrl = null;

        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file, 'ecommerce/wholesale', 'auto');
            fileUrl = uploaded.url;
        }

        const wholesale = new Wholesale({
            name,
            surname,
            email,
            phone,
            comment,
            file: fileUrl,
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [applications, total] = await Promise.all([
            Wholesale.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Wholesale.countDocuments()
        ]);

        const pages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            data: applications,
            total,
            page,
            pages
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

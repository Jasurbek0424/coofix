const chatService = require('./chat.service');

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const response = await chatService.generateResponse(message);

        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

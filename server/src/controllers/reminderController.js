const reminderService = require('../services/reminderService');

// @desc    Send manual reminder
// @route   POST /api/reminders/:id/send
// @access  Private
const sendManualReminder = async (req, res) => {
    try {
        const reminder = await reminderService.sendReminder(req.params.id, req.user);
        res.status(200).json(reminder);
    } catch (error) {
        console.error(error);
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else if (error.message.includes('expired') || error.message.includes('window')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Failed to send reminder' });
        }
    }
};

module.exports = {
    sendManualReminder,
};

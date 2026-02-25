const Issue = require('../models/Issue');

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const issue = await Issue.create({
            title,
            description,
            reportedBy: req.user._id,
            status: 'open'
        });

        res.status(201).json(issue);
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ message: 'Server error creating issue' });
    }
};

// @desc    Get issues
// @route   GET /api/issues
// @access  Private
const getIssues = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        // If not admin/staff, only see own issues
        if (!['admin', 'staff'].includes(req.user.role)) {
            query.reportedBy = req.user._id;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const issues = await Issue.find(query)
            .populate('reportedBy', 'name email mobile shopName')
            .populate('comments.addedBy', 'name role')
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        console.error('Error getting issues:', error);
        res.status(500).json({ message: 'Server error getting issues' });
    }
};

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Private/Admin
const updateIssueStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.status = status;
        const updatedIssue = await issue.save();

        res.json(updatedIssue);
    } catch (error) {
        console.error('Error updating issue status:', error);
        res.status(500).json({ message: 'Server error updating issue status' });
    }
};

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Only admins/staff or the issue creator can comment
        if (!['admin', 'staff'].includes(req.user.role) && issue.reportedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to comment on this issue' });
        }

        const comment = {
            text,
            addedBy: req.user._id,
            isAdmin: ['admin', 'staff'].includes(req.user.role)
        };

        issue.comments.push(comment);
        const updatedIssue = await issue.save();

        // Populate the new comment logic cleanly before returning
        const populatedIssue = await Issue.findById(updatedIssue._id)
            .populate('reportedBy', 'name email mobile shopName')
            .populate('comments.addedBy', 'name role');

        res.status(201).json(populatedIssue);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error adding comment' });
    }
};

module.exports = {
    createIssue,
    getIssues,
    updateIssueStatus,
    addComment
};

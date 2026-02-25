const express = require('express');
const router = express.Router();
const {
    createIssue,
    getIssues,
    updateIssueStatus,
    addComment
} = require('../controllers/issueController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createIssue)
    .get(protect, getIssues);

router.route('/:id/status')
    .patch(protect, admin, updateIssueStatus);

router.route('/:id/comments')
    .post(protect, addComment);

module.exports = router;

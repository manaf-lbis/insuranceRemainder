const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image');
    }

    res.status(200).json({
        url: req.file.path,
        public_id: req.file.filename
    });
});

module.exports = {
    uploadImage
};

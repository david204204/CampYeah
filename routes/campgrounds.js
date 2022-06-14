const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoogedIn, isAuthor, validateCampground } = require('../middlware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })




router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoogedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createNewCamp));
// .post(upload.single('image'), (req,res)=>{
//     res.send(req.body);
// })
router.get('/new', isLoogedIn, catchAsync(campgrounds.renderNewForm));

router.route('/:id')
    .get(catchAsync(campgrounds.showCampgrounds))
    .put(isLoogedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoogedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds));

router.get('/:id/edit', isLoogedIn, isAuthor, catchAsync(campgrounds.editCampground));




module.exports = router;
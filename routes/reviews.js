const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoogedIn, isReviewAuthor } = require('../middlware');
const review = require('../controllers/reviews');


router.post('/', isLoogedIn, validateReview, catchAsync(review.createNewReview));


router.delete('/:reviewId', isLoogedIn, isReviewAuthor, catchAsync(review.deletedReview));



module.exports = router;
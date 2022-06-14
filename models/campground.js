const mongoose = require('mongoose');
const Review = require('./review')

const Schema = mongoose.Schema;

//for resize img to 200X200 create new image schema and rplace with it the url 
const ImageSchema = new Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type : {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`
});


// this is middleware that responsible for delete all the chiled reviews in case that campground was deleted
//this is post - the meaning is that this func will run after the delete (ONLY WITH findOneAndDelete)
CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})



module.exports = mongoose.model('Campground', CampgroundSchema);
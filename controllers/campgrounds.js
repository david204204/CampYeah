const Campground =require('../models/campground');
const { cloudinary} = require("../cloudinary");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', {campgrounds})
}
module.exports.createNewCamp = async (req, res,next) => {
     
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
     
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
    
}
module.exports.renderNewForm = async(req,res)=>{
    
    res.render('campgrounds/new')
}
module.exports.showCampgrounds = async(req,res,next)=>{
const campgrounds = await Campground.findById(req.params.id).populate({
    path: 'reviews',
    populate: {
        path: 'author'
    }
}).populate('author');
if(!campgrounds){
    req.flash('error', 'Cannot find that campground')
    return res.redirect('/campgrounds')
}
res.render('./campgrounds/show', {campgrounds})
}

module.exports.editCampground = async(req,res,next)=>{
    const {id} = req.params;
    const campgrounds = await Campground.findById(id);
    if(!campgrounds){
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('./campgrounds/edit', {campgrounds})
}

module.exports.updateCampground = async(req,res,next)=>{
    const {id} = req.params;
    //console.log(req.body);
    const campgrounds = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f=>({url: f.path, filename: f.filename}));
    campgrounds.images.push(...imgs);
    await campgrounds.save();
    //if we want to delete image
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campgrounds.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages } } } } )
        
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`./${campgrounds._id}`)
    //res.send(campgrounds._id)
}

module.exports.deleteCampgrounds = async(req,res,next)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect(`/campgrounds`)
    //res.send(campgrounds._id)
    
}
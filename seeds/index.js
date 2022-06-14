const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedsHelper');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Databse connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62a472a54e8ea350ad1d06b0',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatem magnam ipsum, eaque ducimus adipisci quos quam provident? Fugit aspernatur et natus ipsam reiciendis, doloremque aliquam ducimus non iure iusto recusandae!',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ddpmhumqy/image/upload/v1655058056/YelpCamp/hqe3qr1sotzr499k6maz.jpg',
                    filename: 'YelpCamp/hqe3qr1sotzr499k6maz',

                },
                {
                    url: 'https://res.cloudinary.com/ddpmhumqy/image/upload/v1655058080/YelpCamp/j1yncc7rgbbtifz0r5in.jpg',
                    filename: 'YelpCamp/j1yncc7rgbbtifz0r5in',

                },
                {
                    url: 'https://res.cloudinary.com/ddpmhumqy/image/upload/v1655057358/YelpCamp/pgnky3w62ta7asmccpoh.jpg',
                    filename: 'YelpCamp/pgnky3w62ta7asmccpoh',

                },
                {
                    url: 'https://res.cloudinary.com/ddpmhumqy/image/upload/v1655057401/YelpCamp/et2opeect9b7zxe4huji.jpg',
                    filename: 'YelpCamp/et2opeect9b7zxe4huji',

                }
            ]

        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
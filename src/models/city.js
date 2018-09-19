let mongoose = require('mongoose');
let _ = require('lodash');
let Schema = mongoose.Schema;

let citySchema = new Schema({

    status:String,
    business: String,
    location: [{

        lat: String,
        lng: String
    }],

    addressComponent:[{
        country: String,
        province: String,
        city: String
    }],

    pois: [{
        addr: String,
    }],

    sematic_description: String,
    cityCode: String


});

module.exports = mongoose.model("CitySchema", citySchema);
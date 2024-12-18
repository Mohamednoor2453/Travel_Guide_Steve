const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: String,
    location: String,
    food: String,
    foodDesc: String, // Description for food
    drinks: String,
    drinksDesc: String, // Description for drinks
    accomodation: String,
    accomodationDesc: String, // Description for accommodation
    conference: String,
    conferenceDesc: String, // Description for conference
    camping: String,
    campingDesc: String, // Description for camping
    BoatRiding: String,
    boatDesc: String, // Description for boat riding
    TeamBuilding: String,
    teamDesc: String, // Description for team building
    contacts: String,
    batches: String
});

const Sites = mongoose.model('Sites', siteSchema);
module.exports = Sites;

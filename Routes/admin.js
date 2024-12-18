require('dotenv').config();
const express = require('express');
const PDFDocument = require('pdfkit'); // PDF generation library
const Sites = require('../model/sites.js'); // Your site model

const router = express.Router();

router.post('/addingSite', async (req, res) => {
    try {
        const {
            name, location, food, foodDesc,
            drinks, drinksDesc, accomodation, accomodationDesc,
            conference, conferenceDesc, camping, campingDesc,
            BoatRiding, boatDesc, TeamBuilding, teamDesc,
            contacts, batches
        } = req.body;

        const newSite = new Sites({
            name,
            location,
            food,
            foodDesc,  // Save food description
            drinks,
            drinksDesc,  // Save drinks description
            accomodation,
            accomodationDesc,  // Save accommodation description
            conference,
            conferenceDesc,  // Save conference description
            camping,
            campingDesc,  // Save camping description
            BoatRiding,
            boatDesc,  // Save boat riding description
            TeamBuilding,
            teamDesc,  // Save team building description
            contacts,
            batches
        });

        await newSite.save();
        console.log("Site added successfully");
        res.redirect("/addedSites"); // Redirect to the all sites page
    } catch (error) {
        console.error("Error adding site:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



//rendering form for adding sites
router.get('/addingSite',(req, res)=>{
    res.render('addSites.ejs')
})

// Route to display all sites
router.get('/addedSites', async (req, res) => {
    try {
        const sites = await Sites.find().sort({ _id: -1 });
        res.render('all_sites.ejs', { title: 'All Sites', sites });
    } catch (error) {
        console.error("Error fetching sites:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route to display specific site details
router.get('/site/:id', async (req, res) => {
    try {
        const site = await Sites.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: "Site not found" });
        }
        res.render('site_details.ejs', { site }); // Render site_details.ejs
    } catch (error) {
        console.error("Error displaying site:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Route to download PDF
router.get('/sitePdfDownload/:id', async (req, res) => {
    try {
        const site = await Sites.findById(req.params.id);

        if (!site) {
            return res.status(404).json({ message: "Site not found" });
        }

        const fileName = `${site.name.replace(/ /g, '_')}_details.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(res);

        // Title
        pdfDoc.fontSize(18).text(`Site Details`, { align: 'center' }).moveDown();

        // Basic Information
        pdfDoc.fontSize(14)
            .text(`Name: ${site.name}`)
            .text(`Location: ${site.location}`)
            .moveDown(0.5); // Space between sections

        // Availability Information with Descriptions
        const sections = [
            { label: 'Food', available: site.food, description: site.foodDesc },
            { label: 'Drinks', available: site.drinks, description: site.drinksDesc },
            { label: 'Accommodation', available: site.accomodation, description: site.accomodationDesc },
            { label: 'Conference', available: site.conference, description: site.conferenceDesc },
            { label: 'Camping', available: site.camping, description: site.campingDesc },
            { label: 'Boat Riding', available: site.BoatRiding, description: site.boatDesc },
            { label: 'Team Building', available: site.TeamBuilding, description: site.teamDesc }
        ];

        sections.forEach(section => {
            pdfDoc.text(`${section.label}: ${section.available ? 'Available' : 'Not Available'}`)
                .moveDown(0.3) // Small space between status and description
                .text(`Description: ${section.description || 'No description available'}`)
                .moveDown(0.5); // Space between sections
        });

        // Contacts and Batches
        pdfDoc.text(`Contacts: ${site.contacts}`)
            .text(`Batches: ${site.batches}`);

        // Finalize the PDF
        pdfDoc.end();
    } catch (error) {
        console.error("Error generating PDF:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;

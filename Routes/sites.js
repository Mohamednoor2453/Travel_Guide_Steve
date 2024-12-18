// sites.js
const express = require('express');
const mongoose = require('mongoose');
const Product = require('../model/sites.js');

const router = express.Router();

// Helper function to fetch products based on the batch
const getSiteByBatch = async (batch) => {
    return await Product.find({ batches: batch }).sort({ _id: -1 })
};

// Rendering batch1 sites
router.get('/batch1', async (req, res) => {
    try {
        const batch1 = await getSiteByBatch('batch1');  // Corrected function usage

        // Render the page with batch1 products
        res.status(200).render('batch1', { title: 'Batch1 Sites', batch1 });
    } catch (error) {
        res.status(500).json({ error: error.message });  // Corrected error message
    }
});


// Rendering batch1 sites
router.get('/batch2', async (req, res) => {
    try {
        const batch2 = await getSiteByBatch('batch2');  // Corrected function usage

        // Render the page with batch1 products
        res.status(200).render('batch2', { title: 'Batch2 Sites', batch2 });
    } catch (error) {
        res.status(500).json({ error: error.message });  // Corrected error message
    }
});

router.get('/batch3', async (req, res) => {
    try {
        const batch3 = await getSiteByBatch('batch3');  // Corrected function usage

        // Render the page with batch1 products
        res.status(200).render('batch3', { title: 'Batch3 Sites', batch3 });
    } catch (error) {
        res.status(500).json({ error: error.message });  // Corrected error message
    }
});


module.exports = router;

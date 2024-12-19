//routes.js
const express = require('express');
const router = express.Router();
const Sites = require('../model/sites.js');


router.get('/paymentForm', (req, res)=>{
    res.render('paymentForm')
})

router.get('/confirmation', (req, res)=>{
    res.render('confirmation')
})


module.exports = router;

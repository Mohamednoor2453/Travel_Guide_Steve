require("dotenv").config();
const express = require("express");
const axios = require("axios");

const Payment = require("../model/payment.js");

const router = express.Router();

// Middleware to generate access token
const generateToken = async (req, res, next) => {
    const consumer = process.env.SAFARICOM_CONSUMER_KEY;
    const secret = process.env.SAFARICOM_CONSUMER_SECRET;

    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: { Authorization: `Basic ${auth}` },
            }
        );

        req.token = response.data.access_token; // Store access token in request
        next();
    } catch (err) {
        console.error("Error generating token:", err.message);
        res.status(400).json({ error: err.message });
    }
};

// Route to initiate STK Push
router.post("/stk", generateToken, async (req, res) => {
    try {
        const phone = req.body.phone.substring(1);
        const amount = req.body.amount;

        // Generate timestamp
        const generateTimestamp = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const day = ("0" + date.getDate()).slice(-2);
            const hours = ("0" + date.getHours()).slice(-2);
            const minutes = ("0" + date.getMinutes()).slice(-2);
            const seconds = ("0" + date.getSeconds()).slice(-2);

            return `${year}${month}${day}${hours}${minutes}${seconds}`;
        };

        const timestamp = generateTimestamp();
        const shortcode = process.env.SAFARICOM_BUSINESS_SHORTCODE;
        const passKey = process.env.SAFARICOM_PASSKEY;
        const password = Buffer.from(`${shortcode}${passKey}${timestamp}`).toString("base64");

        const stkRequestData = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: `254${phone}`,
            PartyB: shortcode,
            PhoneNumber: `254${phone}`,
            CallBackURL: "https://f3db-154-159-238-239.ngrok-free.app/payment/pat",
            AccountReference: "Steve Travel Guide",
            TransactionDesc: "Donation Payment",
        };

        const stkResponse = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            stkRequestData,
            {
                headers: { Authorization: `Bearer ${req.token}` },
            }
        );

        console.log(stkResponse.data);

        if (stkResponse.data.ResponseCode === "0") {
            // Save the transaction as 'incomplete'
            const newTransaction = new Payment({
                phone: phone,
                amount: amount,
                status: "incomplete",
                checkoutRequestID: stkResponse.data.CheckoutRequestID,
            });

            await newTransaction.save();

            res.status(200).json({
                message: "STK Push initiated. Awaiting payment confirmation.",
                CheckoutRequestID: stkResponse.data.CheckoutRequestID,
            });
        } else {
            res.status(400).json({ message: "Failed to initiate STK Push" });
        }
    } catch (error) {
        console.error("Error in STK push request:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route to handle MPESA Callback
router.post("/pat", async (req, res) => {
    const { Body } = req.body;

    const checkoutRequestID = Body?.stkCallback?.CheckoutRequestID;
    const resultCode = Body?.stkCallback?.ResultCode;
    const resultDesc = Body?.stkCallback?.ResultDesc;

    try {
        // Find the donation by CheckoutRequestID
        const payment = await Payment.findOne({ checkoutRequestID });

        if (!payment) {
            console.error("Transaction not found");
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Update the status based on ResultCode
        if (resultCode === 0) {
            payment.status = "complete"; // Success
        } else {
            payment.status = "failed"; // Failure or cancellation
        }

        await payment.save();

        console.log(`Transaction ${checkoutRequestID} updated to: ${payment.status}`);
        res.status(200).json({ message: "Callback received and transaction updated" });
    } catch (error) {
        console.error("Error handling MPESA callback:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "incomplete" }, // Status: 'incomplete', 'complete', or 'failed'
    checkoutRequestID: { type: String, unique: true }, // Link to MPESA callback
    timestamp: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
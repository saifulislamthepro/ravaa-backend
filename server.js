const express = require('express');
const axios = require('axios');   // for HTTP requests
const app = express();

require('dotenv').config();

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req,res) => {
    res.send("payment server is running");
})

app.post('/payment/success', async (req, res) => {
    const data = req.body;
    console.log("Payment success callback:", data);

    try {
        // Step 1: Validate with SSLCommerz
        const validationUrl = `${process.env.VALIDATION_URL}?val_id=${data.val_id}&store_id=${store_id}&store_passwd=${store_passwd}&v=1&format=json`;

        const validationResponse = await axios.get(validationUrl);
        const validationData = validationResponse.data;

        console.log("Validation response:", validationData);

        if (validationData.status === "VALID") {
            // Step 2: Notify local order service
            await axios.post(
                `${process.env.BASE_URL}/api/orders/update`,
                {
                    tran_id: validationData.tran_id,
                    status: "paid"
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            console.log("Order updated successfully");
        } else {
            console.log("Payment not valid:", validationData);
        }

        // Respond back to SSLCommerz
        res.redirect(`${process.env.BASE_URL}/dashboard`);
    } catch (error) {
        console.error("Error validating payment:", error.message);
        res.status(500).send('Payment validation failed');
    }
});

app.post('/payment/ipn', async (req, res) => {
    const data = req.body;
    console.log("Payment success callback:", data);

    try {
        // Step 1: Validate with SSLCommerz
        const validationUrl = `${process.env.VALIDATION_URL}?val_id=${data.val_id}&store_id=${store_id}&store_passwd=${store_passwd}&v=1&format=json`;

        const validationResponse = await axios.get(validationUrl);
        const validationData = validationResponse.data;

        console.log("Validation response:", validationData);

        if (validationData.status === "VALID") {
            // Step 2: Notify local order service
            await axios.post(
                `${process.env.BASE_URL}/api/orders/update`,
                {
                    tran_id: validationData.tran_id,
                    status: "paid"
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            console.log("Order updated successfully");
        } else {
            console.log("Payment not valid:", validationData);
        }

        // Respond back to SSLCommerz
        res.status(200).send("IPN Recieved");
    } catch (error) {
        console.error("Error validating payment:", error.message);
        res.status(500).send('Payment validation failed');
    }
});


app.post('/payment/fail', async (req, res) => {
    const data = req.body;
    console.log("Payment failed callback:", data);

    try {
        // Update order status in your Next.js backend
        await axios.post(`${process.env.BASE_URL}/api/orders/update`, {
            tran_id: data.tran_id,
            status: "FAILED"
        },{
            headers: { "Content-Type": "application/json" }
        });

        console.log("Order marked as FAILED");

        // Redirect user to a failed payment page
        res.redirect(`${process.env.BASE_URL}/dashboard`);
    } catch (error) {
        console.error("Error handling failed payment:", error.message);
        res.status(500).send('Failed payment processing error');
    }
});


app.post('/payment/cancel', async (req, res) => {
    const data = req.body;
    console.log("Payment canceled callback:", data);

    try {
        // Update order status in your Next.js backend
        await axios.post(`${process.env.BASE_URL}/api/orders/update`, {
            tran_id: data.tran_id,
            status: "CANCELED"
        }, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("Order marked as CANCELED");

        // Redirect user to a canceled payment page
        res.redirect(`${process.env.BASE_URL}/dashboard`);
    } catch (error) {
        console.error("Error handling canceled payment:", error.message);
        res.status(500).send('Canceled payment processing error');
    }
});


app.listen(port, () => {
    console.log("Payment server running on port 5000");
});
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/categories", require("./routes/category.routes"));
// app.use("/api/products", require("./routes/product.routes"));
// app.use("/api/cart", require("./routes/cart.routes"));
// app.use("/api/orders", require("./routes/order.routes"));



// health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is healthy ✅" });
});

module.exports = app;
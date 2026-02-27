const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. "product:create"
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
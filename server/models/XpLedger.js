const mongoose = require("mongoose");

const xpLedgerSchema = new mongoose.Schema({
  user: { type: String, required: true },
  source: {
    type: String,
    required: true,
    enum: ["quiz", "workout", "achievement", "weekly_challenge"],
  },
  amount: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ["brain", "body"],
  },
  sourceEntityId: { type: String, default: null },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

xpLedgerSchema.index({ user: 1, createdAt: -1 });
xpLedgerSchema.index({ user: 1, source: 1 });

const XpLedger = mongoose.model("XpLedger", xpLedgerSchema);

module.exports = { XpLedger, xpLedgerSchema };

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,

  productId: mongoose.Schema.Types.ObjectId,

  stripeSessionId: String,

  status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING",
  },
});
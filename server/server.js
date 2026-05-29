import app from "./src/app.js";

const PORT = process.env.PORT || 5000;
import { connectDB } from "./src/config/db.js";
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
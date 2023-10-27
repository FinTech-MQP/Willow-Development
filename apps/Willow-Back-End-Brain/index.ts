import express from "express";
import listingRouter from "./controllers/ListingController";
import interestRouter from "./controllers/InterestController";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.use("/Interest", interestRouter);
app.use("/Listing", listingRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

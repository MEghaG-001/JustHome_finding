const express =require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/justhome";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const listRouter = require("./Router/listing.js");
const reviewRouter = require("./Router/review.js");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/listings",listRouter);
app.use("/listings/:id/reviews",reviewRouter);

main().then(() => console.log("connected to database")

).catch((err) => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req,res) => {
    res.send("Hello World");
});

const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404,errMsg);
    }
    else{
        next();
    }
}

const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404,errMsg);
    }
    else{
        next();
    }
}
// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing({
//         title: "Megha",
//         description: "This is a sample listing",
//         price: 100,
//         location: "New York",
//         country: "USA"
//     });
//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("Listing created");
// });

app.use((req,res,next) =>{
    next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next) =>{
    res.render("error.ejs", {err});
});
app.listen(8080, () => {
    console.log("listening on port 8080");
});
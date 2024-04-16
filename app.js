const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
const cors = require("cors");

// Connect database
mongoose.connect("mongodb://localhost:27017/newdb");

// Define a schema for your collection
const Schema = mongoose.Schema;
const yourSchema = new Schema({
  name: String,
  password: String,
});

// Define a model for your collection
const myModel = mongoose.model("YourModel", yourSchema);

const saltRounds = 10;
const myPassword = "123456";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/api", async (req, res) => {
  const pass = await bcrypt.hash(myPassword, saltRounds);
  res.send(pass);
});

app.post("/api", async (req, res) => {
  try {
    const nm = await myModel.findOne({ name : req.body.name });
    if (nm) {
      res.send("Already have account");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new myModel({
      name: req.body.name,
      password: hashedPassword,
    });
    console.log(hashedPassword);
    await newUser.save();
    console.log("User saved successfully");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await myModel.findOne({ name });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.send("Login successful");
    } else {
      res.status(401).send("Invalid password");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

const port = 3030;
app.listen(port);

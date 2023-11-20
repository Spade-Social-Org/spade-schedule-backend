require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const mongodb_url = `mongodb+srv://${encodeURIComponent(
  process.env.MONGO_DB_USERNAME
)}:${encodeURIComponent(
  process.env.MONGO_DB_PASSWORD
)}@datingschedulecluster.mnzugx9.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 3000;
const mongodb_client = new MongoClient(mongodb_url);
const app = express();
const collection = mongodb_client.db("dates_db").collection("dates");

app.get("/schedule-date", async (req, res) => {
  const { query } = req;
  const inviter = query?.inviter;
  const invitee = query?.invitee;
  const inviter_image = query?.inviter_image;
  const invitee_image = query?.invitee_image;
  const date_timestamp = query?.date_timestamp;
  const place = query?.place;
  const accepted = false;
  const date = {
    inviter,
    invitee,
    date_timestamp,
    place,
    accepted,
    inviter_image,
    invitee_image,
  };
  if (
    inviter != null &&
    invitee != null &&
    date_timestamp != null &&
    place != null &&
    inviter_image != null &&
    invitee_image != null
  ) {
    const id = (await collection.insertOne(date)).insertedId;
    console.log(`https://spade-date.onrender.com/get-date?id=${id}`);
    return res
      .status(200)
      .json({ message: `https://spade-date.onrender.com/get-date?id=${id}` });
  }
  return res.status(400).json({ message: "Invalid request" });
});

app.get("/get-date", async (req, res) => {
  const { query } = req;
  const id = query?.id;
  const dates = await collection.find({ _id: new ObjectId(id) }).toArray();
  if (dates) {
    return res.status(200).json(dates);
  }
  return res.status(400).json({ message: "Date not found" });
});

app.get("/change-date-status", async (req, res) => {
  const { query } = req;
  const id = query?.id;
  const accepted = query?.accepted || false;
  try {
    if (id != null) {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { accepted: accepted } }
      );
      return res.status(200).json({ message: "Date status changed" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Error!" });
  }
  return res.status(400).json({ message: "Invalid request" });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}🎉🎉🎉`);
});

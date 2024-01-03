require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const axios = require("axios");

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
  const inviterId = query?.inviterId;
  const inviteeId = query?.inviteeId;
  const date = query?.date;
  const time = query?.time;
  const placeId = query?.placeId;
  const placeName = query?.placeName;
  const accepted = false;
  const token = query?.token;
  const dateData = {
    inviteeId,
    inviterId,
    date,
    time,
    placeId,
    placeName,
    accepted,
  };
  if (
    inviterId != null &&
    inviteeId != null &&
    date != null &&
    time != null &&
    placeId != null &&
    placeName != null &&
    token != null
  ) {
    const result = await collection.insertOne(dateData);
    const id = result.insertedId;
    const inviterName = await axios.get(
      `https://spade-backend-v3-production.up.railway.app/api/v1/users/profile/${inviterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Inviter name:", inviterName);
    const response = await axios.post(
      "https://spade-backend-v3-production.up.railway.app/api/v1/notifications",
      {
        description: `${inviterName.data.name} has invited you to ${placeName}!`,
        date_id: id,
        user_date_id: Number(inviteeId),
        user_id: Number(inviterId),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status == 200) {
      return res.status(200).json({ message: "OK" });
    }
    return res.status(400).json({ message: "Invalid request" });
  } else {
    return res.status(400).json({
      message: `Incomplete parameters: 
    inviterId: ${inviterId},
    inviteeId: ${inviteeId},
    date: ${date},
    time: ${time},
    placeId: ${placeId},
    placeName: ${placeName},
    token: ${token}
    `,
    });
  }
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

app.get("/get-dates", async (req, res) => {
  const { query } = req;
  const creator_id = query?.creator_id;
  const dates = await collection.find({ creator_id }).toArray();
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

app.get("/ping", (req, res) => {
  return res.status(200).json({ message: "pong" });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}🎉🎉🎉`);
});

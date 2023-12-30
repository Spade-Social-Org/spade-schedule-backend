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
  const inviterId = query?.inviter;
  const inviteeId = query?.invitee;
  const date_timestamp = query?.date_timestamp;
  const place = query?.place;
  const placeId = query?.placeId;
  const placeName = query?.placeName;
  const accepted = false;
  const token = query?.token;
  const date = {
    inviteeId,
    inviterId,
    date_timestamp,
    place,
    placeId,
    placeName,
    accepted,
  };
  if (
    inviterId != null &&
    inviteeId != null &&
    date_timestamp != null &&
    place != null &&
    placeId != null &&
    placeName != null &&
    token != null
  ) {
    const result = await collection.insertOne(date);
    const id = result.insertedId;
    await Notify(token, placeName, id, inviteeId, inviterId);
    const inviterName = await axios.get(
      "https://spade-backend-v3-production.up.railway.app/api/v1/users/" +
        user_id,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const response = await axios.post(
      "https://spade-backend-v3-production.up.railway.app/api/v1/notifications",
      {
        description: `${inviterName} has invited you to ${placeName}!`,
        date_id: id,
        user_date_id: inviteeId,
        user_id: inviterId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status == 200) {
      return res
        .status(200)
        .json({ message: `https://spade-date.onrender.com/get-date?id=${id}` });
    } else {
      return res.status(400).json({ message: "Error!" });
    }
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

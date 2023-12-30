const axios = require("axios");

export async function Notify(token, placeName, date_id, user_date_id, user_id) {
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
      date_id: date_id,
      user_date_id: user_date_id,
      user_id: user_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status == 200) {
    return true;
  } else {
    return false;
  }
}

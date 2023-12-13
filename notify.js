const axios = require("axios");

async function Notify(token, inviter, place, date_id, user_date_id, user_id) {
  const response = await axios.post(
    "https://spade-backend-v3-production.up.railway.app/api/v1/notifications",
    {
      description: `${inviter} has invited you to ${place}!`,
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

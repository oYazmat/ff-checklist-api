const express = require("express");
const json2csv = require("@json2csv/plainjs");

const app = express();

const port = 3000;

app.get("/", (_req, res) => {
  res.send("live");
});

app.get("/export.csv", async (_req, res) => {
  const profileData = await fetch(
    "https://ff-checklist-default-rtdb.firebaseio.com/profile.json",
    {
      method: "GET",
    }
  ).then((res) => res.json());

  const completedData = await fetch(
    "https://ff-checklist-default-rtdb.firebaseio.com/completed.json",
    {
      method: "GET",
    }
  ).then((res) => res.json());

  const fullData = [];
  const titleKeys = [];

  for (const userId in profileData) {
    const userData = {
      userId: userId,
      username: profileData[userId].username,
    };

    completedData[userId]?.forEach((titleKey) => {
      const safeTitleKey = `'${titleKey}`;

      if (!titleKeys.includes(safeTitleKey)) titleKeys.push(safeTitleKey);

      userData[safeTitleKey] = 1;
    });

    fullData.push(userData);
  }

  const parser = new json2csv.Parser({
    fields: ["userId", "username", ...titleKeys],
  });
  const csv = parser.parse(fullData);

  res.header("Content-Disposition", "attachment;filename=export.csv");
  res.type("text/csv");
  res.send(csv);
});

app.listen(port, () => {
  console.log(`FF Checklist API listening on port ${port}`);
});

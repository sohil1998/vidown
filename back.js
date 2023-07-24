require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ytdl = require("ytdl-core");
const axios = require("axios");
const cheerio = require("cheerio");

const mongoose = require("mongoose");

const getVideo = async (url) => {
  // calls axios to go to the page and stores the result in the html variable
  const html = await axios.get(url);
  // calls cheerio to process the html received

  const $ = cheerio.load(html.data);

  let videoString = "";

  const regex = /"contentUrl"\s*:\s*"([^"]+)"/;
  const match = regex.exec(html.data);
  if (match && match[1]) {
    const contentUrl = match[1];

    let videoString1 = contentUrl.replace(/\\/g, "");
    videoString = videoString1.replace(/u0025/g, "%");
    console.log(videoString);
  } else {
    console.log("contentUrl not found in the HTML data");
  }

  //videoString = $("meta[property='og:video']").attr("content");

  console.log("videoString", videoString);
  // returns the videoString
  return videoString;
};

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((response) => {
    console.log("succ");
  })
  .catch((e) => {
    console.log("fail", e);
  });

const app = express();
const port = 3000; // Change this to your desired port number

app.use(cors());

app.get("/download", async (req, res) => {
  const youtubeURL = req.query.url; // Get the YouTube video URL from the query parameters

  try {
    // Use ytdl-core to download the YouTube video
    const videoInfo = await ytdl.getInfo(youtubeURL);
    const videoStream = ytdl.downloadFromInfo(videoInfo);

    // Set the response headers to indicate a video download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${
        Math.floor(Math.random() * (100000 - 0 + 1)) + 0
      }.mp4"`
    );
    res.setHeader("Content-Type", "video/mp4");

    // Pipe the video stream to the response object to send the video file to the frontend
    videoStream.pipe(res);
  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).send("Error downloading video");
  }
});

app.get("/downloadIG", async (request, response) => {
  console.log("request coming in...");

  try {
    const videoLink = await getVideo(request.query.url);

    if (videoLink !== undefined) {
      console.log("videoLink", videoLink);
      response.json({ downloadLink: videoLink });
    } else {
      // if the videoLink is invalid, send a JSON response back to the user
      response.json({ error: "The link you have entered is invalid. " });
    }
  } catch (err) {
    // handle any issues with invalid links
    response.json({
      error: "There is a problem with the link you have provided.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

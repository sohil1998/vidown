import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Animation, Animation1 } from "./animation";
import axios from "axios";

const VideoScreen = () => {
  const [textInput, setTextInput] = useState("");
  const [InitialUrl, setInitialUrl] = useState("");

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  function extractYouTubeVideoId(url) {
    const regex =
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const API_URL = `https://vidown.onrender.com/`;

  const handleDownload1 = async (url) => {
    const youtubeURL = await url;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    try {
      const downloadResult = FileSystem.createDownloadResumable(
        youtubeURL,
        FileSystem.documentDirectory +
          `video${Math.floor(Math.random() * (100000 - 0 + 1)) + 0}.mp4`
      );

      const { uri } = await downloadResult.downloadAsync();
      await MediaLibrary.createAssetAsync(uri);
      await handleShare(uri);

      alert("Video downloaded and saved successfully!");
      setLoading(false);
      setProgress(0);
    } catch (error) {
      setLoading(false);
      console.error("Error downloading video:", error);
    }
  };

  const handleDownload = async () => {
    const videoId = await extractYouTubeVideoId(textInput);
    let url = `${API_URL}download?url=${videoId}`;

    console.log(url);

    try {
      setLoading(true);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(JSON.stringify(response.url));
      handleDownload1(response.url);
    } catch (error) {
      setLoading(false);
      console.error("Error downloading video:", error);
      Alert.alert("Error", "Failed to download video");
    }
  };

  const handleShare = async (videoUri) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        return;
      }
      await Sharing.shareAsync(videoUri);
    } catch (error) {
      console.error("Error sharing video:", error);
    }
    setTextInput("");
  };

  const handleDownloadIG = async () => {
    setLoading(true);

    const videoId = textInput;
    let url = `${API_URL}downloadIG?url=${videoId}`;
    console.log(videoId);
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.downloadLink) {
          handleDownload1(data.downloadLink);
        } else {
          console.log(data);
          Alert.alert("Error", "Invalid link or no video found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch data from the server.");
      });
  };

  downloadFromRapidApiIG = async () => {
    const options = {
      method: "GET",
      url: "https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info-rapidapi",
      params: {
        // url: "https://www.instagram.com/reel/C1U6tQLu1vv/",
        url: textInput,
      },
      headers: {
        "x-rapidapi-key": "d1756884bdmsh6e9604cfd54c70ap1456cdjsnd283df28cfad",
        "x-rapidapi-host":
          "instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data?.download_url);
      handleDownload1(response.data?.download_url);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  downloadFromRapidApiYT = async () => {
    const options = {
      method: "POST",
      url: "https://youtube-quick-video-downloader.p.rapidapi.com/api/youtube/links",
      headers: {
        "x-rapidapi-key": "d1756884bdmsh6e9604cfd54c70ap1456cdjsnd283df28cfad",
        "x-rapidapi-host": "youtube-quick-video-downloader.p.rapidapi.com",
        "Content-Type": "application/json",
        "X-Forwarded-For": "70.41.3.18",
      },
      data: {
        url: textInput,
      },
    };

    try {
      const response = await axios.request(options);
      console.log(JSON.stringify(response.data[0]?.urls[0].url));
      handleDownload1(response.data[0]?.urls[0].url);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    getUrl();
  });

  const getUrl = async () => {
    const initialUrl = await Linking.getInitialURL();
    console.log(initialUrl);
    setInitialUrl(initialUrl);
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={textInput}
        placeholder="Enter video URL"
        onChangeText={(e) => {
          setTextInput(e);
        }}
      />

      <Text style={styles.buttonText}>{InitialUrl}</Text>

      {textInput && textInput.includes("https") && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => {
            setLoading(true);
            if (extractYouTubeVideoId(textInput)) {
              //handleDownload();
              downloadFromRapidApiYT();
            } else if (textInput.includes("instagram")) {
              // handleDownloadIG();
              downloadFromRapidApiIG();
              return;
            } else {
              alert("As of now we only have Youtube and Instagram feature");
            }
          }}
        >
          <Text style={styles.buttonText}>
            {loading ? "Downloading...." : "Download"}
          </Text>
        </TouchableOpacity>
      )}
      {loading ? (
        <View style={{ height: 200, width: 200 }}>
          <Animation />
          <Text
            style={{
              textAlign: "center",
              fontSize: 18,
            }}
          >
            Video Download Hone Tak Tu Mera Dance Dekh...
          </Text>
        </View>
      ) : (
        <>
          {textInput.includes("https") ? null : (
            <View style={{ height: 200, width: 200 }}>
              <Animation1 />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                }}
              >
                Video ki link kaha hai...
              </Text>
            </View>
          )}
        </>
      )}
      {progress > 0 && (
        <Text>{`Download Progress: ${(progress * 100).toFixed(2)}%`}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    width: "80%",
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  video: {
    width: "80%",
    height: 200,
    marginBottom: 20,
  },
  downloadButton: {
    width: 150,
    height: 40,
    backgroundColor: "#fbd912",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VideoScreen;

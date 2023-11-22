import React, { Component } from "react";
import { View } from "react-native";
import Lottie from "lottie-react-native";

export class Animation extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Lottie
          source={require("./assets/animation.json")}
          autoPlay
          loop
          style={{ flex: 1 }}
        />
      </View>
    );
  }
}

export class Animation1 extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Lottie
          source={require("./assets/animation1.json")}
          autoPlay
          loop
          style={{ flex: 1 }}
        />
      </View>
    );
  }
}

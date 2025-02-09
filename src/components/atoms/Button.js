import React from "react";
import { TouchableOpacity, Text, Image, View, StyleSheet } from "react-native";

const ButtonPrimary = ({ onPress, children }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.buttonContent}>
        <Text style={styles.buttonText}>{children}</Text>
        <View style={styles.reflection1} />
        <View style={styles.reflection2} />
      </View>
      <Image
        source={require("../../assets/images/star.png")}
        style={styles.star1}
      />
      <Image
        source={require("../../assets/images/star.png")}
        style={styles.star2}
      />
      <Image
        source={require("../../assets/images/circle.png")}
        style={styles.circle1}
      />
      <Image
        source={require("../../assets/images/circle.png")}
        style={styles.circle2}
      />
      <Image
        source={require("../../assets/images/diamond.png")}
        style={styles.diamond}
      />
      <Image
        source={require("../../assets/images/triangle.png")}
        style={styles.triangle}
      />

      <View style={styles.shadow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 50,
    borderWidth: 2,
    borderColor   : "hsl(0, 0.00%, 0.00%)",
    backgroundColor: "hsl(54, 88.40%, 52.70%)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textTransform: "uppercase",
  },
  reflection1: {
    position: "absolute",
    width: "80%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    top: 5,
    left: "10%",
    borderRadius: 5,
  },
  reflection2: {
    position: "absolute",
    width: "60%",
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    bottom: 5,
    left: "20%",
    borderRadius: 5,
  },
  shadow: {
    position: "absolute",
    width: "100%",
    height: 8,
    backgroundColor: "rgba(0,0,0,0.15)",
    bottom: -4,
    borderRadius: 10,
  },
  star1: { position: "absolute", top: -12, left: -12, width: 20, height: 20 },
  star2: { position: "absolute", top: -8, right: -12, width: 20, height: 20 },
  circle1: {
    position: "absolute",
    bottom: -12,
    left: 5,
    width: 15,
    height: 15,
  },
  circle2: {
    position: "absolute",
    bottom: -8,
    right: 10,
    width: 15,
    height: 15,
  },
  diamond: {
    position: "absolute",
    left: 10, // Décale vers la gauche
    top: "50%", // Centre verticalement
    transform: [{ translateY: -10 }], // Ajuste le centrage vertical
    width: 20,
    height: 20,
  },
  triangle: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
  },
});

export default ButtonPrimary;

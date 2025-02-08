import React from "react";
import { FlatList, ImageBackground, StyleSheet } from "react-native";
import CardPlat from "../molecules/CardPlat";

const CommandeList = ({ plats, onDelete }) => {
  return (
    <ImageBackground
      source={require("../../assets/kitchen_background.png")}
      style={styles.background}
    >
      <FlatList
        data={plats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CardPlat plat={item} onDelete={onDelete} />}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CommandeList;

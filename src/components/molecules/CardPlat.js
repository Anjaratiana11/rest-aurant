import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const CardPlat = ({ plat, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(plat.id)} style={styles.card}>
      <Text style={styles.title}>{plat.nom || "Nom inconnu"}</Text>
      <Text style={styles.time}>⏳ {plat.tempsDePreparation || "N/A"} sec</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffcc80", // 🎨 Orange crèmeux
    padding: 15,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: "#5a2d0c",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: "#d35400", // 🍊 Contour cartoon
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a2003",
  },
  time: {
    fontSize: 14,
    color: "#8B4513",
    marginTop: 5,
  },
});

export default CardPlat;

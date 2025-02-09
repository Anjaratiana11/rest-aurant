import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const Navbar = ({ items }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.href}
          onPress={() => navigation.navigate(item.href)}
          style={styles.navItem}
        >
          <Ionicons
            name={item.icon}
            size={28}
            color={"#333"} // Couleur du texte définie
            style={styles.icon}
          />
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "hsl(337, 53%, 85%)", // Couleur de fond primaire
    borderTopWidth: 3,
    borderTopColor: "#cc2e63", // Couleur secondaire
    shadowColor: "rgba(52, 152, 219, 0.4)",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "hsla(0, 0%, 100%, 0.449)", // Effet de reflet
    shadowColor: "rgba(52, 152, 219, 0.4)",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333", // Texte en noir
    textShadowColor: "rgba(52, 152, 219, 0.2)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});

export default Navbar;

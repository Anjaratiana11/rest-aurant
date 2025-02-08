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
            color="#fff"
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
    backgroundColor: "#8B4513", // 🍫 Marron chocolaté
    borderTopWidth: 5,
    borderTopColor: "#d35400", // 🍊 Style cartoon
    shadowColor: "#5a2d0c",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20, // Coins arrondis pour les boutons
    // backgroundColor: "#ff6347", // Fond retiré
    shadowColor: "#5a2d0c",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6, // Effet d'élévation
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12, // Taille du texte réduite pour un look cohérent
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});

export default Navbar;

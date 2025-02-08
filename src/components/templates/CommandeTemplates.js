import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CommandeList from "../organisms/CommandeList";
import ButtonPrimary from "../atoms/Button";

const CommandeTemplate = ({ plats, total, onDelete, onValidate }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍔 Votre Commande 🍟</Text>
      <CommandeList plats={plats} onDelete={onDelete} />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total : {total} Ar</Text>
      </View>
      <ButtonPrimary onPress={onValidate}>🛒 Payer</ButtonPrimary>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffebcd", // 🍪 Fond couleur biscuit
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#d35400",
    textShadowColor: "#8B4513",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 3,
  },
  totalContainer: {
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 4,
    borderTopColor: "#d35400",
    alignItems: "center",
  },
  totalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e74c3c",
  },
});

export default CommandeTemplate;

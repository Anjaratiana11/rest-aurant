import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { getPlats, getPrixPlat } from "../services/SymfonyService";
import Navbar from "../components/molecules/Navbar";
import CardPlat from "../components/molecules/CardPlat";
import Layout from "../components/common/Layout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PlatsScreen = ({ navigation }) => {
  const [userId, setUserId] = useState(null);
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("UserID récupéré :", storedUserId);
        } else {
          console.log("Aucun UserID trouvé, redirection vers Login...");
          navigation.navigate("LoginScreen");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur :", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchPlats = async () => {
      try {
        console.log("Récupération des plats...");
        const data = await getPlats();
        console.log("Plats récupérés :", data);

        const platsAvecPrix = await Promise.all(
          data.map(async (plat) => {
            const prix = await getPrixPlat(plat.id);
            return { ...plat, prix };
          })
        );

        setPlats(platsAvecPrix);
      } catch (err) {
        console.error("Erreur lors de la récupération des plats :", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlats();
  }, [userId]);

  const handlePlatPress = (platId) => {
    navigation.navigate("PlatDetailsScreen", { platId });
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Supprimer l'ID utilisateur de AsyncStorage
      await AsyncStorage.removeItem("userId");
      console.log("Utilisateur déconnecté");

      // Rediriger vers la page de connexion
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  const navItems = [
    { href: "PlatsScreen", icon: "restaurant", label: "Plats" },
    { href: "CommandeScreen", icon: "receipt", label: "Commande" },
    { href: "PayerScreen", icon: "cash", label: "Payer" },
    { href: "LoginScreen", icon: "log-out", label: "Déconnexion", onPress: handleLogout }, // Ajout du bouton de déconnexion
  ];

  return (
    <Layout>
      <FlatList
        data={plats}
        keyExtractor={(item) => (item.id ? item.id.toString() : "default-key")}
        renderItem={({ item }) => (
          <CardPlat plat={item} onPress={handlePlatPress} />
        )}
      />
      <Navbar items={navItems} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  error: {
    color: "red",
    textAlign: "center",
  },
});

export default PlatsScreen;

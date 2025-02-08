import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getPlats } from "../services/SymfonyService";
import Navbar from "../components/molecules/Navbar"; 
import CardPlat from "../components/molecules/CardPlat"; 
import Layout from "../components/common/Layout"; 


const PlatsScreen = ({ route, navigation }) => {
  const { idToken } = route.params || {};

  console.log("PlatsScreen - idToken reçu :", idToken);

  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idToken) {
      setError("Aucun idToken reçu !");
      setLoading(false);
      return;
    }

    const fetchPlats = async () => {
      try {
        console.log("Récupération des plats...");
        const data = await getPlats();
        console.log("Plats récupérés :", data);
        setPlats(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des plats :", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlats();
  }, [idToken]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  const handlePlatPress = (platId) => {
    navigation.navigate("PlatDetailsScreen", { platId });
  };

  const navItems = [
    { href: "HomeScreen", icon: "home", label: "Accueil" },
    { href: "PlatsScreen", icon: "restaurant", label: "Plats" },
    { href: "CommandeScreen", icon: "receipt", label: "Commande" },
  ];

  return (
     <Layout>
    
     {/*<View style={styles.tokenContainer}>
        <Text style={styles.tokenTitle}>ID Token :</Text>
        <Text style={styles.token}>{idToken || "Aucun token reçu"}</Text>
      </View>*/}

      <FlatList
        data={plats}
        keyExtractor={(item) => (item.id ? item.id.toString() : "default-key")}
        renderItem={({ item }) => (
          <CardPlat plat={item} onPress={handlePlatPress} />
        )}
      />

      {/* Navbar en bas */}
      <Navbar items={navItems} />
  
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  tokenContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 10,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  token: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
});

export default PlatsScreen;

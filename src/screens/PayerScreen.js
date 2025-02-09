import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getCommandeDetails,
  getPlatDetails,
  getCommandeActuelle,
  validerCommande,
  getPrixPlat,
  getSommeCommande,
  getStatusColor,
} from "../services/SymfonyService";
import ButtonPrimary from "../components/atoms/Button";
import { ImageBackground } from "react-native";
import Navbar from "../components/molecules/Navbar";
import Layout from "../components/common/Layout";
import { useNavigation } from "@react-navigation/native";

const PayerScreen = () => {
  const [userId, setUserId] = useState(null);
  const [idCommande, setIdCommande] = useState(null);
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
        } else {
          console.log("Aucun userId trouvé dans le stockage");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du userId:", error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId === null) return;
    const fetchCommandeId = async () => {
      try {
        const id = await getCommandeActuelle(userId);
        if (!id) throw new Error("Aucune commande en cours trouvée");
        setIdCommande(id);
      } catch (err) {
        setError(err.message || "Erreur inconnue");
        console.error(err);
      }
    };
    fetchCommandeId();
  }, [userId]);

  useEffect(() => {
    if (!idCommande) return;
    const fetchCommandeDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const detailsCommande = await getCommandeDetails(idCommande);
        if (!detailsCommande || detailsCommande.length === 0) {
          throw new Error("Aucun plat dans cette commande");
        }

        const platsDetails = await Promise.all(
          detailsCommande.map(async (item) => {
            const plat = await getPlatDetails(item.idPlat);
            const prix = await getPrixPlat(item.idPlat);
            return { ...plat, prix, id: item.id, statut: item.statut };
          })
        );

        setPlats(platsDetails);
        const totalPrice = await getSommeCommande(idCommande);
        setTotal(totalPrice);
      } catch (err) {
        setError(err.message || "Erreur inconnue");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommandeDetails();
  }, [idCommande]);

  const handleValiderCommande = async () => {
    if (!idCommande) {
      Alert.alert("Erreur", "Aucune commande à valider.");
      return;
    }
  
    try {
      const response = await validerCommande(idCommande);
      if (response.statut === 0) {
        Alert.alert("Succès", response.message, [
          { text: "OK", onPress: () => navigation.navigate("PlatsScreen") }
        ]);
      } else {
        Alert.alert("Erreur", "Une erreur est survenue lors de la validation.");
      }
    } catch (error) {
      Alert.alert("Erreur", error.message || "Erreur lors de la validation.");
      console.error(error);
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
    { href: "LoginScreen", icon: "log-out", label: "Déconnexion", onPress: async () => {
        await AsyncStorage.removeItem("userId");
        navigation.navigate("LoginScreen");
      }
    },
  ];

  return (
    <Layout>
      <ImageBackground source={require("../assets/images/fond.png")} style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text style={styles.title}>Vos Commandes</Text>
          <FlatList
            data={plats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemName}>{item.nom}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.statut) }]}>
                {item.statut === -1
                  ? "Panier"
                  : item.statut === 0
                  ? "En préparation"
                  : item.statut === 2
                  ? "Notif"
                  : item.statut === 3
                  ? "Livré"
                  : "--"}
              </Text>
              </View>
            )}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total :</Text>
            <Text style={styles.totalAmount}>{total} Ar</Text>
          </View>
          <ButtonPrimary onPress={handleValiderCommande}>Payer</ButtonPrimary>
          
        </View>
      </ImageBackground>
      <Navbar items={navItems} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20, 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "hsl(337, 53%, 85%)",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemName: {
    fontSize: 18,
    color: "hsl(337, 53%, 85%)",
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "hsl(337, 53%, 85%)",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "hsl(337, 53%, 85%)",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "hsl(69, 73.90%, 56.50%)",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
});

export default PayerScreen;

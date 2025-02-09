import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  getPlatDetails,
  getPlatsIngredients,
  getIngredientDetails,
  getCommandeActuelle,
  ajouterPlatCommande,
} from "../services/SymfonyService";
import ButtonPrimary from "../components/atoms/Button";
import { Ionicons } from "@expo/vector-icons";
import Layout from "../components/common/Layout";
import Input from "../components/atoms/Input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../components/molecules/Navbar";

const PlatDetailsScreen = ({ route, navigation }) => {
  const { platId } = route.params;
  console.log("Plat ID reçu :", platId);

  const [plat, setPlat] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantite, setQuantite] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur :", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchPlatDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const platData = await getPlatDetails(platId);
        if (!platData) throw new Error("Détails du plat non trouvés");
        setPlat(platData);

        const ingredientsIds = await getPlatsIngredients(platId);
        if (!ingredientsIds || ingredientsIds.length === 0) {
          throw new Error("Aucun ingrédient trouvé pour ce plat");
        }

        const ingredientsDetails = await Promise.all(
          ingredientsIds.map(async (ingredientId) => {
            return await getIngredientDetails(ingredientId);
          })
        );
        setIngredients(ingredientsDetails);
      } catch (err) {
        setError(err.message || "Erreur inconnue");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatDetails();
  }, [platId]);

  const handleCommander = async () => {
    try {
      if (!quantite || isNaN(quantite) || parseInt(quantite) <= 0) {
        alert("Veuillez entrer une quantité valide !");
        return;
      }

      if (!plat) {
        alert("Erreur : Impossible de commander un plat inconnu.");
        return;
      }

      if (!userId) {
        alert("Erreur : ID utilisateur non trouvé.");
        return;
      }

      const idCommande = await getCommandeActuelle(userId);

      if (!idCommande) {
        alert("Aucune commande en cours trouvée !");
        return;
      }

      await ajouterPlatCommande(idCommande, plat.id, parseInt(quantite));

      alert(`Le plat ${plat.nom} a été ajouté à votre commande !`);

      setQuantite("");
      setIsModalVisible(false);

      navigation.navigate("CommandeScreen", { idCommande });
    } catch (error) {
      console.error("Erreur de commande :", error);
      alert("Erreur lors de la commande. Veuillez réessayer.");
    }
  };

  const navItems = [
    { href: "PlatsScreen", icon: "restaurant", label: "Plats" },
    { href: "CommandeScreen", icon: "receipt", label: "Commande" },
    { href: "PayerScreen", icon: "cash", label: "Payer" },
    { href: "LoginScreen", icon: "log-out", label: "Déconnexion" },
  ];

  if (loading) {
    return <ActivityIndicator size="large" color="#cc2e63" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <Layout>
      <View style={styles.container}>
        {plat && (
          <View style={styles.content}>
            <Text style={styles.title}>{plat.nom}</Text>
            <Text style={styles.text}>⏳ Temps de préparation: {plat.tempsDePreparation} sec</Text>

            <Text style={styles.subtitle}>🥦 Ingrédients :</Text>
            <FlatList
              data={ingredients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <Text style={styles.ingredientItem}>{item.nom}</Text>}
              ListEmptyComponent={<Text style={styles.text}>Aucun ingrédient trouvé</Text>}
            />

            <ButtonPrimary onPress={() => setIsModalVisible(true)}>
              Commander
            </ButtonPrimary>
          </View>
        )}

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Commander {plat?.nom}</Text>
              <Input
                placeholder="Quantité"
                keyboardType="numeric"
                value={quantite}
                onChangeText={setQuantite}
                style={styles.input}
              />
              <ButtonPrimary onPress={handleCommander}>Commander</ButtonPrimary>
            </View>
          </View>
        </Modal>
      </View>
      <Navbar items={navItems} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15, // Ajoute un petit espace sur les côtés
    paddingBottom: 70, // Laisse de la place pour la Navbar
  },
  content: {
    backgroundColor: "hsl(337, 53%, 85%)",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#5a2d0c",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    marginVertical: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#cc2e63",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
    color: "#3c8d1f",
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  ingredientItem: {
    backgroundColor: "#e0f7fa",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default PlatDetailsScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
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

const PlatDetailsScreen = ({ route, navigation }) => {
  const { platId } = route.params;
  console.log("Plat ID reçu :", platId);

  const [plat, setPlat] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantite, setQuantite] = useState("");

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

      const userId = 1; // Remplace avec l'ID réel de l'utilisateur connecté
      const idCommande = await getCommandeActuelle(userId);

      if (!idCommande) {
        alert("Aucune commande en cours trouvée !");
        return;
      }

      await ajouterPlatCommande(idCommande, plat.id, parseInt(quantite));

      alert(`Le plat ${plat.nom} a été ajouté à votre commande !`);

      setQuantite(""); // Remettre la quantité à zéro
      setIsModalVisible(false);

      navigation.navigate("CommandeScreen", { idCommande });
    } catch (error) {
      console.error("Erreur de commande :", error);
      alert("Erreur lors de la commande. Veuillez réessayer.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <Layout>
      <View>
        {plat && (
          <View>
            <Text style={styles.title}>{plat.nom}</Text>
            <Text>Temps de préparation: {plat.tempsDePreparation} sec</Text>

            <Text style={styles.subtitle}>Ingrédients :</Text>
            <FlatList
              data={ingredients}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <Text>{item.nom}</Text>}
              ListEmptyComponent={<Text>Aucun ingrédient trouvé</Text>}
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
                style={styles.input} // Appliquer les styles personnalisés si nécessaire
              />
              <ButtonPrimary onPress={handleCommander}>Commander</ButtonPrimary>
            </View>
          </View>
        </Modal>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5", // Fond clair pour un look plus frais
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ff6347", // Couleur tomate pour un côté gourmand
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
    color: "#3c8d1f", // Vert pour rappeler les légumes frais
  },
  error: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fond plus sombre pour le modal
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 22,
    color: "#ff6347", // Couleur tomate pour rester dans l'ambiance
    marginBottom: 15,
  },
  input: {
    width: "100%",
    padding: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 12,
    zIndex: 10,
  },
  button: {
    backgroundColor: "#ff6347", // Bouton de commande coloré
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  ingredientItem: {
    backgroundColor: "#e0f7fa", // Fond bleu clair pour les ingrédients
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  flatListContainer: {
    marginTop: 15,
  },
});



export default PlatDetailsScreen;

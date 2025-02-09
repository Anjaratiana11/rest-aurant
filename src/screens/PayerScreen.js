import React, { useState, useEffect } from "react"; 
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";  // Import AsyncStorage
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

const PayerScreen = () => {
  const [userId, setUserId] = useState(null);  // Modifier pour stocker userId
  const [idCommande, setIdCommande] = useState(null);
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  // Récupération de l'ID utilisateur depuis AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");  // Récupère l'ID utilisateur
        if (storedUserId) {
          setUserId(parseInt(storedUserId));  // Met à jour l'état avec l'ID utilisateur récupéré
        } else {
          console.log("Aucun userId trouvé dans le stockage");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du userId:", error);
      }
    };
    fetchUserId();
  }, []);

  // Récupération de l'ID de la commande
  useEffect(() => {
    if (userId === null) return;  // Ne pas faire de requêtes si userId n'est pas encore récupéré

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

  // Récupérer les détails de la commande
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

        // Détails de chaque plat
        const platsDetails = await Promise.all(
          detailsCommande.map(async (item) => {
            const plat = await getPlatDetails(item.idPlat);
            const prix = await getPrixPlat(item.idPlat);
            return { ...plat, prix, id: item.id, statut: item.statut };
          })
        );

        setPlats(platsDetails);

        // Calcul du total de la commande
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

  // Valider la commande
  const handleValiderCommande = async () => {
    if (!idCommande) {
      alert("Aucune commande à valider.");
      return;
    }

    try {
      const response = await validerCommande(idCommande);
      if (response.statut === 0) {
        alert(response.message);
      } else {
        alert("Une erreur est survenue lors de la validation.");
      }
    } catch (error) {
      alert(error.message || "Erreur lors de la validation.");
      console.error(error);
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  // Affichage en cas d'erreur
  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commande #{idCommande}</Text>

      <FlatList
        data={plats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.nom}</Text>
            <Text style={styles.itemPrice}>{item.prix} Ar</Text>
            <Text style={[styles.itemStatus, { color: getStatusColor(item.statut) }]}>
              {item.statut === -1
                ? "Panier"
                : item.statut === 0
                ? "En préparation"
                : item.statut === 2
                ? "Livré"
                : "Statut inconnu"}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
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
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "bold",
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
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
});

export default PayerScreen;

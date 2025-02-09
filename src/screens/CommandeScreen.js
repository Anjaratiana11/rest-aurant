import React, { useState, useEffect } from "react"; 
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from "react-native"; 
import { 
  getCommandeDetails, 
  getPlatDetails, 
  getCommandeActuelle, 
  validerCommande, 
  deleteDetailCommande, 
  getPrixPlat, 
  getSommeCommande, 
  preparerCommande 
} from "../services/SymfonyService"; 
import { FontAwesome } from "@expo/vector-icons"; 
import { Ionicons } from "@expo/vector-icons"; 
import { useNavigation } from "@react-navigation/native"; 
import ButtonPrimary from "../components/atoms/Button"; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Si tu utilises AsyncStorage

const CommandeScreen = ({ route }) => {
  const [userId, setUserId] = useState(null); // L'état pour l'ID de l'utilisateur
  const navigation = useNavigation();
  
  const [idCommande, setIdCommande] = useState(null);
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  // Récupérer l'utilisateur en session
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Récupérer l'utilisateur à partir du stockage (ou autre mécanisme que tu utilises)
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(parseInt(storedUserId)); // Mettre à jour avec l'ID utilisateur
        } else {
          // Gérer le cas où il n'y a pas d'utilisateur en session
          setError("Utilisateur non connecté");
        }
      } catch (err) {
        setError("Erreur lors de la récupération de l'utilisateur");
        console.error(err);
      }
    };

    fetchUserId();
  }, []); // Cette logique ne dépend que du montage du composant

  // Récupération de l'ID de la commande
  useEffect(() => {
    if (userId === null) return; // Ne pas continuer si l'ID utilisateur n'est pas encore disponible

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
  }, [userId]); // Effect déclenché lorsque userId change

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
      const response = await preparerCommande(idCommande);

      if (response && response.message) {
        alert(response.message); 
        navigation.navigate("PayerScreen");
      } else {
        alert("Une erreur est survenue lors de la validation.");
      }
    } catch (error) {
      alert(error.message || "Erreur lors de la validation.");
      console.error(error);
    }
  };

  // Supprimer un plat de la commande
  const handleDeleteDetail = async (idDetail) => {
    Alert.alert(
      "Supprimer ce plat",
      "Êtes-vous sûr de vouloir supprimer ce plat de votre commande ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              await deleteDetailCommande(idDetail);
              setPlats((prevPlats) =>
                prevPlats.filter((item) => item.id !== idDetail)
              );
              const newTotal = plats.reduce(
                (sum, plat) => (plat.id !== idDetail ? sum + plat.prix : sum),
                0
              );
              setTotal(newTotal);
            } catch (error) {
              alert("Erreur lors de la suppression.");
              console.error(error);
            }
          },
        },
      ]
    );
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
        data={[...plats, { id: "add", nom: "+", prix: "" }]} // Ajouter un élément "+" à la fin de la liste
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.id !== "add" ? ( // Vérifie si l'élément n'est pas celui du "+"
              <>
                <Text style={styles.itemName}>{item.nom}</Text>
                <Text style={styles.itemPrice}>{item.prix} Ar</Text>
                <TouchableOpacity onPress={() => handleDeleteDetail(item.id)}>
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => navigation.navigate("PlatsScreen")}
              >
                <Text style={styles.addItemText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total :</Text>
        <Text style={styles.totalAmount}>{total} Ar</Text>
      </View>

      <ButtonPrimary onPress={handleValiderCommande}>Valider</ButtonPrimary>
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
  floatingButton: {
    position: "absolute",
    bottom: 80, // Positionner le bouton au-dessous de la liste de plats
    right: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  addItemButton: {
    flexDirection: "row",
    justifyContent: "center", // Centrer le contenu horizontalement
    alignItems: "center", // Centrer le contenu verticalement
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 10, // Un peu d'espace avant et après le bouton "+"
    borderBottomWidth: 1, // Si tu veux une ligne sous le bouton "+"
    borderBottomColor: "#ccc", // Bordure comme les autres plats
  },
  addItemText: {
    fontSize: 24, // Taille plus grande pour le "+"
    fontWeight: "bold", // Gras pour le "+"
    color: "blue", // Couleur personnalisée pour le "+"
  },
});

export default CommandeScreen;

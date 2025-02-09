import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ImageBackground 
} from "react-native";
import { 
  getCommandeDetails, 
  getPlatDetails, 
  getCommandeActuelle,  
  deleteDetailCommande, 
  getPrixPlat, 
  getSommeCommande, 
  preparerCommande 
} from "../services/SymfonyService";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ButtonPrimary from "../components/atoms/Button";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from "../components/molecules/Navbar";
import Layout from "../components/common/Layout";

const CommandeScreen = ({ route }) => {
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();
  
  const [idCommande, setIdCommande] = useState(null);
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
        } else {
          setError("Utilisateur non connecté");
        }
      } catch (err) {
        setError("Erreur lors de la récupération de l'utilisateur");
        console.error(err);
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

  const handleDeleteDetail = async (idDetail) => {
    Alert.alert(
      "Supprimer ce plat",
      "Êtes-vous sûr de vouloir supprimer ce plat de votre commande ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: async () => {
          try {
            await deleteDetailCommande(idDetail);
            setPlats((prevPlats) => prevPlats.filter((item) => item.id !== idDetail));
            const newTotal = plats.reduce(
              (sum, plat) => (plat.id !== idDetail ? sum + plat.prix : sum),
              0
            );
            setTotal(newTotal);
          } catch (error) {
            alert("Erreur lors de la suppression.");
            console.error(error);
          }
        } }
      ]
    );
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
    }}
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
                <Text style={styles.itemPrice}>{item.prix} Ar</Text>
                <TouchableOpacity onPress={() => handleDeleteDetail(item.id)}>
                  <FontAwesome name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total :</Text>
            <Text style={styles.totalAmount}>{total} Ar</Text>
          </View>
          <ButtonPrimary onPress={handleValiderCommande}>Valider</ButtonPrimary>
        </View>
      </ImageBackground>
      <TouchableOpacity 
  style={styles.floatingButton} 
  onPress={() => navigation.navigate("PlatsScreen")}
>
  <FontAwesome name="plus-circle" size={50} color="#cc2e63" />
</TouchableOpacity>
      <Navbar items={navItems} />
    </Layout>
  );
};


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  
  container: {
    flex: 1,
    padding: 16,
    
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
    borderBottomColor: "#cc2e63",
  },
  itemName: {
    fontSize: 18,
    color: "#cc2e63",
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#cc2e63",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#cc2e63",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#cc2e63",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "hsl(69, 73.90%, 56.50%)",
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  addItemButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cc2e63",
  },
  addItemText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#cc2e63",
  },
  floatingButton: {
    position: "absolute",
    bottom: 80, // Ajuste pour qu'il ne soit pas caché par la navbar
    right: 20,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default CommandeScreen;

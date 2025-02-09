import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Input from "../components/atoms/Input";
import ButtonPrimary from "../components/atoms/Button";
import { inscrireUtilisateur } from "../services/SymfonyService"; 
import AsyncStorage from "@react-native-async-storage/async-storage";


const SignupScreen = () => {
  const [nom, setNom] = useState("");
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [password, setPassword] = useState("");
  const [mail, setMail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      // Appel à la fonction d'inscription
      const result = await inscrireUtilisateur(nom, nomUtilisateur, password, mail);
      console.log("Inscription réussie :", result);

      if (result && result.id) {
        // Sauvegarde de l'ID utilisateur dans AsyncStorage
        await AsyncStorage.setItem("userId", result.id.toString());
        console.log("ID utilisateur stocké :", result.id);
        
        // Redirection vers la page des plats avec l'ID utilisateur
        navigation.navigate("PlatsScreen", { userId: result.id });
      } else {
        console.error("Erreur lors de l'inscription : ID utilisateur non trouvé !");
        Alert.alert("Erreur", "Impossible de s'inscrire, veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      Alert.alert("Erreur", "Échec de l'inscription. Veuillez vérifier vos informations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Nom"
        value={nom}
        onChangeText={setNom}
      />
      <Input
        placeholder="Nom d'utilisateur"
        value={nomUtilisateur}
        onChangeText={setNomUtilisateur}
      />
      <Input
        placeholder="Email"
        value={mail}
        onChangeText={setMail}
        keyboardType="email-address"
      />
      <Input
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <ButtonPrimary onPress={handleSignUp} disabled={loading}>
        <Text>S'inscrire</Text>
      </ButtonPrimary>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
});

export default SignupScreen;

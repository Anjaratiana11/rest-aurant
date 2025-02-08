import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { login } from "../services/FirebaseService";
import { useNavigation } from "@react-navigation/native";
import ButtonPrimary from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import Layout from "../components/common/Layout";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import de l'icône œil

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    console.log("Tentative de connexion avec :", email);

    try {
      const result = await login(email, password);
      console.log("Connexion réussie :", result);

      const { idToken } = result;
      if (idToken) {
        console.log("idToken récupéré :", idToken);
        Alert.alert("Connexion réussie", "Vous êtes connecté avec succès !");
        navigation.navigate("PlatsScreen", { idToken });
      } else {
        console.error("Erreur : idToken non trouvé !");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.spacerInput} />
        <View style={styles.passwordContainer}>
          <Input
            style={[styles.input, { paddingRight: 40 }]}
            placeholder="Mot de passe"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="black"
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>

        {/* Espacement entre le champ de mot de passe et le bouton */}
        <View style={styles.spacer} />

        {/* Utilisation de ButtonPrimary */}
        <ButtonPrimary onPress={handleLogin} disabled={loading}>
          <Text>Se connecter</Text>
        </ButtonPrimary>

        {/* Espacement entre le bouton et le message d'erreur */}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    marginBottom: 16, // Espacement entre chaque input
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  passwordContainer: {
    position: "relative", // Nécessaire pour positionner l'œil à l'intérieur de l'input
  },
  eyeIcon: {
    position: "absolute",
    right: 10, // Place l'icône à droite de l'input
    top: 15, // Ajuste pour être centré verticalement
  },
  spacer: {
    marginBottom: 20, // Espacement avant le bouton
  },
  spacerInput: {
    marginBottom: 10, // Espacement avant le bouton
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export default LoginScreen;

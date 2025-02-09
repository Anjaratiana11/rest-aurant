import React, { useState } from "react";  
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import ButtonPrimary from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import Layout from "../components/common/Layout";
import Ionicons from "react-native-vector-icons/Ionicons";
import { connexionUtilisateur } from "../services/SymfonyService"; // Assure-toi que ce chemin est correct

const LoginScreen = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    console.log("Tentative de connexion avec :", nomUtilisateur);

    try {
      const result = await connexionUtilisateur(nomUtilisateur, password);
      console.log("Connexion réussie :", result);

      if (result && result.id) {
        await AsyncStorage.setItem("userId", result.id.toString());
        console.log("ID utilisateur stocké :", result.id);
        navigation.navigate("PlatsScreen", { userId: result.id });
      } else {
        console.error("Erreur : ID utilisateur non trouvé !");
        setError("Identifiants incorrects !");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setError("Échec de connexion. Vérifiez vos identifiants.");
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
          value={nomUtilisateur}
          onChangeText={setNomUtilisateur}
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

        <View style={styles.spacer} />

        <ButtonPrimary onPress={handleLogin} disabled={loading}>
          <Text>Se connecter</Text>
        </ButtonPrimary>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.spacerText} />
        <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
          <Text style={styles.signupText}>Pas de compte ? S'inscrire</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 15,
  },
  spacer: {
    marginBottom: 20,
  },
  spacerInput: {
    marginBottom: 16,
  },
  spacerText: {
    marginTop: 20,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  signupText: {
    textAlign: "center",
    marginTop: 10,
    color: "hsl(337, 53%, 85%)",
  },
});

export default LoginScreen;
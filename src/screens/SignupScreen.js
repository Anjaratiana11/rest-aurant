import React, { useState } from "react";
import {
  Button,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { signup } from "../services/FirebaseService";
import ButtonPrimary from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import Layout from "../components/common/Layout"; 

const SignupScreen = ({ navigation }) => {
  // Ajoute navigation ici
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signup(email, password);
      console.log("Inscription réussie:", result);

      Alert.alert(
        "Inscription réussie",
        "Votre compte a été créé avec succès !"
      );

      // Redirection vers la page de connexion après inscription
      navigation.navigate("LoginScreen");
    } catch (err) {
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
      <Input
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <ButtonPrimary onPress={handleSignup}>
        {loading ? "Chargement..." : "S'inscrire"}
      </ButtonPrimary>

      {/* Affichage du lien vers la connexion */}
      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.link}>Déjà un compte ? Connecte-toi</Text>
      </TouchableOpacity>

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

  link: {
    marginTop: 15,
    color: "#3498db", // Bleu pour ressembler à un lien
    textAlign: "center",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export default SignupScreen;

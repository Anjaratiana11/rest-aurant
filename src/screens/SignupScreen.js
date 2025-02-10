import React, { useState } from "react"; 
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";


import Layout from "../components/common/Layout";
import Input from "../components/atoms/Input";
import ButtonPrimary from "../components/atoms/Button";
import { inscrireUtilisateur } from "../services/SymfonyService"; 

const SignupScreen = () => {
  const [nom, setNom] = useState("");
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [password, setPassword] = useState("");
  const [mail, setMail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!nom || !nomUtilisateur || !password || !mail) {
      Alert.alert("Erreur", "Tous les champs doivent être remplis.");
      return;
    }
  
    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
  
    setLoading(true);
    try {
      const result = await inscrireUtilisateur(nom, nomUtilisateur, password, mail);
      console.log("Inscription réussie :", result);
  
      if (result && result.id) {
        await AsyncStorage.setItem("userId", result.id.toString());
        navigation.navigate("PlatsScreen", { userId: result.id });
      } else {
        Alert.alert("Erreur", "Impossible de s'inscrire, veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      Alert.alert("Erreur", err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Layout>
      <View style={styles.container}>
        <Input placeholder="Nom" value={nom} onChangeText={setNom} />
        <View style={styles.spacerInput} />
        
        <Input placeholder="Nom d'utilisateur" value={nomUtilisateur} onChangeText={setNomUtilisateur} />
        <View style={styles.spacerInput} />
        
        <Input placeholder="Email" value={mail} onChangeText={setMail} keyboardType="email-address" />
        <View style={styles.spacerInput} />

        <View style={styles.passwordContainer}>
          <Input
            placeholder="Mot de passe"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { paddingRight: 40 }]}
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

        <ButtonPrimary onPress={handleSignUp} disabled={loading}>
          <Text>S'inscrire</Text>
        </ButtonPrimary>

        <View style={styles.spacerText} />
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <Text style={styles.signupText}>Déjà un compte ? Se connecter</Text>
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
  signupText: {
    textAlign: "center",
    marginTop: 10,
    color: "hsl(337, 53%, 85%)",
  },
});

export default SignupScreen;

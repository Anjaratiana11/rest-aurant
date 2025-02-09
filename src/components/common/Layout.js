import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";

const Layout = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../assets/images/sky.jpg')} // Remplacez par le chemin de votre image
      style={styles.container}
    >
      {children}
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0, // Supprime les marges latérales
    paddingVertical: 0, // Supprime les marges verticales
    justifyContent: "flex-start", // Garde le contenu en haut sans déformer la navbar
    alignItems: "stretch", // Étire le contenu sur toute la largeur
  },
});


export default Layout;

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
    padding: 16,
    justifyContent: 'center',  // Vous pouvez ajuster cela selon le contenu
  },
});

export default Layout;

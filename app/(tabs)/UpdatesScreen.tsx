import React from "react";
import { StyleSheet, SafeAreaView, StatusBar } from "react-native";
import UpdatesList from "@/components/UpdatesList";
import { NovuProvider } from "@novu/react-native";

export default function UpdatesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <NovuProvider
        subscriberId="683fca0bf43b5880d26e406e"
        applicationIdentifier="B3GsFiU8FPXI"
      >
        <UpdatesList />
      </NovuProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

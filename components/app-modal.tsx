import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { ThemedButton } from "@/components/themed-button";

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function AppModal({ visible, onClose, title, children }: AppModalProps) {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {title && <Text style={styles.title}>{title}</Text>}
          {children}
          <ThemedButton title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
  },
});

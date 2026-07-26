import { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { getTransactions, createTransaction } from "../api";

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleAdd = async () => {
    setMessage("");
    try {
      await createTransaction(parseFloat(amount), description, category);
      setAmount("");
      setDescription("");
      setCategory("");
      loadTransactions();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Transaction</Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowAmount}>{item.amount} BD</Text>
            <Text style={styles.rowDesc}>{item.description} · {item.category}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  message: { textAlign: "center", color: "#c00", marginVertical: 8 },
  list: { marginTop: 16 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  rowAmount: { fontSize: 18, fontWeight: "600" },
  rowDesc: { fontSize: 14, color: "#666", marginTop: 2 },
  empty: { textAlign: "center", color: "#999", marginTop: 32 },
});
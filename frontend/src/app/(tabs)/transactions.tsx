import { useState, useEffect } from "react";
import { Text, View, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import {
  getTransactions,
  createTransaction,
  getCategories,
  createCategory,
  updateTransaction,
  deleteTransaction,
} from "../../api";
import { clearTokens } from "../../auth";
import { colors, spacing, radius, fonts, shadow } from "../../theme";

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !category) setCategory(data[0].name);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleAdd = async () => {
    setMessage("");
    try {
      if (editingId !== null) {
        await updateTransaction(editingId, parseFloat(amount), description, category);
        setEditingId(null);
      } else {
        await createTransaction(parseFloat(amount), description, category);
      }
      setAmount("");
      setDescription("");
      loadTransactions();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setAmount(item.amount.toString());
    setDescription(item.description || "");
    setCategory(item.category || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setDescription("");
  };

  const handleDelete = async (id: number) => {
    setMessage("");
    try {
      await deleteTransaction(id);
      if (editingId === id) cancelEdit();
      loadTransactions();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleAddCategory = async () => {
    setMessage("");
    try {
      const created = await createCategory(newCategory);
      setNewCategory("");
      setShowNewCategory(false);
      await loadCategories();
      setCategory(created.name);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handlePickerChange = (value: string) => {
    if (value === "__add_new__") setShowNewCategory(true);
    else setCategory(value);
  };

  const handleLogout = async () => {
    await clearTokens();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Add / edit form card */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor={colors.muted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.pickerWrapper}>
          <Picker selectedValue={category} onValueChange={handlePickerChange} style={styles.picker}>
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
            ))}
            <Picker.Item label="+ Add new category" value="__add_new__" />
          </Picker>
        </View>

        {showNewCategory ? (
          <View style={styles.newCategoryRow}>
            <TextInput
              style={[styles.input, styles.newCategoryInput]}
              placeholder="New category name"
              placeholderTextColor={colors.muted}
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TouchableOpacity style={styles.smallButton} onPress={handleAddCategory}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>
            {editingId !== null ? "Update Transaction" : "Add Transaction"}
          </Text>
        </TouchableOpacity>

        {editingId !== null ? (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowAmount}>{item.amount} BD</Text>
              <Text style={styles.rowDesc}>{item.description} · {item.category}</Text>
            </View>
            <TouchableOpacity style={styles.rowAction} onPress={() => startEdit(item)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowAction} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.s4, paddingTop: 60 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.s4 },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.text },
  logout: { fontFamily: fonts.bodySemibold, color: colors.accent, fontSize: 14 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.s4, ...shadow.card },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.neutral100,
    borderRadius: radius.md,
    padding: spacing.s3,
    marginBottom: spacing.s3,
    fontSize: 16,
    color: colors.text,
  },
  pickerWrapper: { backgroundColor: colors.neutral100, borderRadius: radius.md, marginBottom: spacing.s3 },
  picker: { fontFamily: fonts.body, color: colors.text, borderWidth: 0, backgroundColor: "transparent" },
  newCategoryRow: { flexDirection: "row", gap: spacing.s2, marginBottom: spacing.s3 },
  newCategoryInput: { flex: 1, marginBottom: 0 },
  smallButton: { backgroundColor: colors.accent, paddingHorizontal: spacing.s4, justifyContent: "center", borderRadius: radius.md },
  button: { backgroundColor: colors.accent, padding: spacing.s3, borderRadius: radius.lg, alignItems: "center", marginTop: spacing.s1 },
  buttonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 16 },
  cancelButton: { backgroundColor: colors.neutral200, padding: spacing.s3, borderRadius: radius.lg, alignItems: "center", marginTop: spacing.s2 },
  cancelText: { fontFamily: fonts.bodySemibold, color: colors.text, fontSize: 16 },
  message: { fontFamily: fonts.body, textAlign: "center", color: colors.accent800, marginVertical: spacing.s2 },
  list: { marginTop: spacing.s4 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.s3, marginBottom: spacing.s2, ...shadow.card },
  rowContent: { flex: 1 },
  rowAmount: { fontFamily: fonts.bodySemibold, fontSize: 18, color: colors.text },
  rowDesc: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  rowAction: { paddingHorizontal: spacing.s2 },
  editText: { fontFamily: fonts.bodySemibold, color: colors.accent },
  deleteText: { fontFamily: fonts.bodySemibold, color: colors.accent800 },
  empty: { fontFamily: fonts.body, textAlign: "center", color: colors.muted, marginTop: spacing.s8 },
});
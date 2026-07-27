import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ChevronDown, ChevronUp, ArrowDownCircle, ArrowUpCircle, X } from "lucide-react-native";
import { router } from "expo-router";
import {
  getTransactions,
  createTransaction,
  getCategories,
  createCategory,
  updateTransaction,
  deleteTransaction,
  getCurrentMonth,
  createMonth,
  chooseLeftoverChoice,
} from "../../api";
import { clearTokens } from "../../auth";
import { colors, spacing, radius, fonts, shadow } from "../../theme";

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // null while GET /months/current hasn't resolved yet — the loading spinner
  // renders only in that window, so we never flash the wrong state/prompt.
  const [month, setMonth] = useState<any | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [startingBalanceInput, setStartingBalanceInput] = useState("");

  // Add/edit transaction modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const listRef = useRef<ScrollView>(null);
  const [listY, setListY] = useState(0);

  useEffect(() => {
    loadMonth();
    loadTransactions();
    loadCategories();
  }, []);

  const loadMonth = async () => {
    try {
      const data = await getCurrentMonth();
      setMonth(data);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

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

  const handleSetStartingBalance = async () => {
    setMessage("");
    try {
      await createMonth(parseFloat(startingBalanceInput) || 0);
      setStartingBalanceInput("");
      await loadMonth();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleLeftoverChoice = async (choice: "savings" | "add_to_balance" | "discard") => {
    setMessage("");
    try {
      await chooseLeftoverChoice(month.leftover_month_id, choice);
      await loadMonth();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setAmount("");
    setDescription("");
    setKind("expense");
    setShowNewCategory(false);
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setAmount(Math.abs(item.amount).toString());
    setDescription(item.description || "");
    setCategory(item.category || "");
    setKind(item.amount < 0 ? "expense" : "income");
    setShowNewCategory(false);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSave = async () => {
    setMessage("");
    // The modal collects an unsigned amount plus an Expense/Income toggle;
    // the backend still just wants one signed number, same as before.
    const signedAmount = kind === "expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));
    try {
      if (editingId !== null) {
        await updateTransaction(editingId, signedAmount, description, category);
      } else {
        await createTransaction(signedAmount, description, category);
      }
      setModalVisible(false);
      await loadTransactions();
      await loadMonth();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    setMessage("");
    try {
      await deleteTransaction(id);
      setModalVisible(false);
      await loadTransactions();
      await loadMonth();
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

  const handleLogout = async () => {
    await clearTokens();
    router.replace("/");
  };

  const scrollToFullList = () => {
    listRef.current?.scrollTo({ y: listY, animated: true });
  };

  const recent = transactions.slice(0, 5);

  const renderTransactionRow = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.row} onPress={() => openEditModal(item)}>
      <View style={styles.rowContent}>
        <Text style={styles.rowDesc}>{item.description || "Untitled"}</Text>
        <View style={styles.rowChip}>
          <Text style={styles.rowChipText}>{item.category || "Other"}</Text>
        </View>
      </View>
      <Text style={styles.rowAmount}>
        {item.amount >= 0 ? "+" : "-"}${Math.abs(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView ref={listRef} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Home</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Log out</Text>
          </TouchableOpacity>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {month === null ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.s8 }} />
        ) : (
          <>
            {/* Cycle card: full data when a current month exists, otherwise a
                lightweight header only — there's no balance to show yet. */}
            {month.status === "exists" ? (
              <TouchableOpacity
                style={styles.cycleCard}
                activeOpacity={0.85}
                onPress={() => setExpanded((e) => !e)}
              >
                <View style={styles.cycleHeaderRow}>
                  <Text style={styles.cycleLabel}>THIS MONTH</Text>
                  {expanded ? (
                    <ChevronUp color={colors.accent} size={18} strokeWidth={2.75} />
                  ) : (
                    <ChevronDown color={colors.accent} size={18} strokeWidth={2.75} />
                  )}
                </View>
                <Text style={styles.balance}>${month.month.balance.toFixed(2)}</Text>
                <View style={styles.inOutRow}>
                  <View style={styles.inOutItem}>
                    <ArrowDownCircle color={colors.accent} size={20} strokeWidth={2.75} />
                    <View>
                      <Text style={styles.inOutLabel}>In</Text>
                      <Text style={styles.inOutValue}>${month.month.money_in.toFixed(2)}</Text>
                    </View>
                  </View>
                  <View style={styles.inOutItem}>
                    <ArrowUpCircle color={colors.accent} size={20} strokeWidth={2.75} />
                    <View>
                      <Text style={styles.inOutLabel}>Out</Text>
                      <Text style={styles.inOutValue}>${month.month.money_out.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                {expanded ? (
                  <View style={styles.expandedDetail}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Starting balance</Text>
                      <Text style={styles.detailValue}>${month.month.starting_balance.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Net this month</Text>
                      <Text style={styles.detailValue}>
                        {month.month.balance - month.month.starting_balance >= 0 ? "+" : "-"}$
                        {Math.abs(month.month.balance - month.month.starting_balance).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : (
              <View style={styles.cycleCard}>
                <Text style={styles.cycleLabel}>THIS MONTH</Text>
              </View>
            )}

            {/* Exactly one conditional section below the cycle card, never both. */}
            {month.status === "needs_leftover_choice" ? (
              <View style={styles.promptCard}>
                <Text style={styles.promptTitle}>
                  Last month left {month.leftover_amount >= 0 ? "" : "-"}$
                  {Math.abs(month.leftover_amount).toFixed(2)} over
                </Text>
                <Text style={styles.promptSubtitle}>What should we do with it?</Text>
                <View style={styles.promptChoices}>
                  <TouchableOpacity onPress={() => handleLeftoverChoice("savings")}>
                    <Text style={styles.promptChoice}>Move to savings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleLeftoverChoice("add_to_balance")}>
                    <Text style={styles.promptChoice}>Add to balance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleLeftoverChoice("discard")}>
                    <Text style={styles.promptChoiceMuted}>Discard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {month.status === "needs_starting_balance" ? (
              <View style={styles.promptCard}>
                <Text style={styles.promptTitle}>Set your starting balance</Text>
                <Text style={styles.promptSubtitle}>We'll track money in/out from here</Text>
                <View style={styles.startingBalanceRow}>
                  <TextInput
                    style={styles.startingBalanceInput}
                    placeholder="$0.00"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={startingBalanceInput}
                    onChangeText={setStartingBalanceInput}
                  />
                  <TouchableOpacity style={styles.setButton} onPress={handleSetStartingBalance}>
                    <Text style={styles.setButtonText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Add transaction is always available — Transaction.month_id is
                nullable, so this never has to wait on the month being set up. */}
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Text style={styles.addButtonText}>Add transaction</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Recent transactions</Text>
              <TouchableOpacity onPress={scrollToFullList}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              {recent.length > 0 ? (
                recent.map(renderTransactionRow)
              ) : (
                <Text style={styles.empty}>No transactions yet.</Text>
              )}
            </View>

            <View onLayout={(e) => setListY(e.nativeEvent.layout.y)}>
              <Text style={styles.sectionHeading}>All transactions</Text>
            </View>
            <View style={styles.card}>
              {transactions.length > 0 ? (
                transactions.map(renderTransactionRow)
              ) : (
                <Text style={styles.empty}>No transactions yet.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add / edit transaction modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {editingId !== null ? "Edit transaction" : "Add transaction"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X color={colors.muted} size={20} strokeWidth={2.75} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Whole Foods"
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleOption, kind === "expense" && styles.toggleOptionActive]}
                onPress={() => setKind("expense")}
              >
                <Text style={[styles.toggleText, kind === "expense" && styles.toggleTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleOption, kind === "income" && styles.toggleOptionActive]}
                onPress={() => setKind("income")}
              >
                <Text style={[styles.toggleText, kind === "income" && styles.toggleTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, category === cat.name && styles.chipActive]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text style={[styles.chipText, category === cat.name && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.chip} onPress={() => setShowNewCategory(true)}>
                <Text style={styles.chipText}>+ New</Text>
              </TouchableOpacity>
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
                  <Text style={styles.smallButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.modalFooterRow}>
              {editingId !== null ? (
                <TouchableOpacity onPress={() => handleDelete(editingId)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
              <View style={styles.modalFooterActions}>
                <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.s4, paddingTop: 60, paddingBottom: spacing.s8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.s4 },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.text },
  logout: { fontFamily: fonts.bodySemibold, color: colors.accent, fontSize: 14 },
  message: { fontFamily: fonts.body, textAlign: "center", color: colors.accent800, marginBottom: spacing.s2 },

  cycleCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.s4, marginBottom: spacing.s3, ...shadow.card },
  cycleHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cycleLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, letterSpacing: 0.5, color: colors.muted },
  balance: { fontFamily: fonts.heading, fontSize: 34, color: colors.text, marginTop: spacing.s1 },
  inOutRow: { flexDirection: "row", gap: spacing.s6, marginTop: spacing.s3 },
  inOutItem: { flexDirection: "row", alignItems: "center", gap: spacing.s2 },
  inOutLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  inOutValue: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  expandedDetail: { marginTop: spacing.s3, paddingTop: spacing.s3, borderTopWidth: 1, borderTopColor: colors.divider },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.s1 },
  detailLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  detailValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },

  promptCard: { backgroundColor: colors.accent100, borderRadius: radius.md, padding: spacing.s4, marginBottom: spacing.s3 },
  promptTitle: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  promptSubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  promptChoices: { flexDirection: "row", gap: spacing.s4, marginTop: spacing.s3 },
  promptChoice: { fontFamily: fonts.bodySemibold, color: colors.accent, fontSize: 14 },
  promptChoiceMuted: { fontFamily: fonts.bodySemibold, color: colors.muted, fontSize: 14 },
  startingBalanceRow: { flexDirection: "row", gap: spacing.s2, marginTop: spacing.s3 },
  startingBalanceInput: { flex: 1, fontFamily: fonts.body, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.s3, fontSize: 16, color: colors.text },
  setButton: { backgroundColor: colors.accent, paddingHorizontal: spacing.s4, justifyContent: "center", borderRadius: radius.md },
  setButtonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 15 },

  addButton: { backgroundColor: colors.accent, padding: spacing.s3, borderRadius: radius.lg, alignItems: "center", marginBottom: spacing.s4 },
  addButtonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 16 },

  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.s2, marginTop: spacing.s2 },
  sectionHeading: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, marginBottom: spacing.s2, marginTop: spacing.s2 },
  seeAll: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.accent },

  card: { backgroundColor: colors.surface, borderRadius: radius.md, ...shadow.card, marginBottom: spacing.s4 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.s3, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowContent: { flex: 1 },
  rowDesc: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  rowChip: { alignSelf: "flex-start", backgroundColor: colors.neutral200, borderRadius: radius.sm, paddingHorizontal: spacing.s2, paddingVertical: 2, marginTop: 4 },
  rowChipText: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  rowAmount: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, fontVariant: ["tabular-nums"] },
  empty: { fontFamily: fonts.body, textAlign: "center", color: colors.muted, padding: spacing.s4 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(29, 31, 32, 0.45)", justifyContent: "center", padding: spacing.s4 },
  modalCard: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.s4 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.s3 },
  modalTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted, marginBottom: spacing.s1 },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.neutral100,
    borderRadius: radius.md,
    padding: spacing.s3,
    marginBottom: spacing.s3,
    fontSize: 16,
    color: colors.text,
  },
  toggleRow: { flexDirection: "row", backgroundColor: colors.neutral100, borderRadius: radius.md, marginBottom: spacing.s3, padding: 3 },
  toggleOption: { flex: 1, paddingVertical: spacing.s2, alignItems: "center", borderRadius: radius.sm },
  toggleOptionActive: { backgroundColor: colors.white, ...shadow.card },
  toggleText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted },
  toggleTextActive: { color: colors.text },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s2, marginBottom: spacing.s3 },
  chip: { borderWidth: 1, borderColor: colors.accent200, borderRadius: radius.lg, paddingHorizontal: spacing.s3, paddingVertical: spacing.s1 },
  chipActive: { backgroundColor: colors.accent100, borderColor: colors.accent },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  chipTextActive: { color: colors.accent },
  newCategoryRow: { flexDirection: "row", gap: spacing.s2, marginBottom: spacing.s3 },
  newCategoryInput: { flex: 1, marginBottom: 0 },
  smallButton: { backgroundColor: colors.accent, paddingHorizontal: spacing.s4, justifyContent: "center", borderRadius: radius.md },
  smallButtonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 14 },
  modalFooterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.s2 },
  modalFooterActions: { flexDirection: "row", gap: spacing.s4, alignItems: "center" },
  deleteText: { fontFamily: fonts.bodySemibold, color: colors.accent800, fontSize: 14 },
  cancelButton: {},
  cancelText: { fontFamily: fonts.bodySemibold, color: colors.muted, fontSize: 15 },
  saveButton: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.s4, paddingVertical: spacing.s2 },
  saveButtonText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 15 },
});

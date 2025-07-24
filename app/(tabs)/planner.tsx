import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { Swipeable } from "react-native-gesture-handler";
// @ts-ignore
import Icon from "react-native-vector-icons/Feather";
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import EraBackgroundWrapper from "@/components/EraBackgroundWrapper";
// @ts-ignore
import Feather from "react-native-vector-icons/Feather";
// @ts-ignore
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

interface Task {
  id: string;
  text: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  done: boolean;
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");
  const [sortBy, setSortBy] = useState<"deadline" | "priority">("deadline");

  const [priorityOpen, setPriorityOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    try {
      const snapshot = await getDocs(
        collection(db, "users", userId, "planner")
      );
      const userTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(userTasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  const addTask = async () => {
    if (!text.trim()) return;

    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    const newTask = {
      text: text.trim(),
      dueDate: dueDate.toISOString().split("T")[0],
      priority,
      done: false,
    };

    try {
      const docRef = await addDoc(
        collection(db, "users", userId, "planner"),
        newTask
      );
      setTasks([...tasks, { ...newTask, id: docRef.id }]);
      setText("");
      setDueDate(new Date());
      setPriority("Low");
      setShowAddTask(false);
      Keyboard.dismiss();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const deleteTask = async (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const userId = await AsyncStorage.getItem("userId");
          if (!userId) return;

          try {
            await deleteDoc(doc(db, "users", userId, "planner", id));
            setTasks(tasks.filter((t) => t.id !== id));
          } catch (err) {
            console.error("Error deleting task:", err);
          }
        },
      },
    ]);
  };

  const toggleDone = async (id: string) => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return;

    const taskToUpdate = tasks.find((t) => t.id === id);
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, done: !taskToUpdate.done };

    try {
      await updateDoc(doc(db, "users", userId, "planner", id), {
        done: updatedTask.done,
      });

      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const getSortedTasks = () => {
    const sorted = [...tasks];
    if (sortBy === "priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      sorted.sort((a, b) => {
        if (order[a.priority] !== order[b.priority]) {
          return order[a.priority] - order[b.priority];
        }
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else {
      sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return sorted;
  };

  const getPriorityColor = (level: Task["priority"]) => {
    switch (level) {
      case "High":
        return "#ffe5e5";
      case "Medium":
        return "#fff5d6";
      case "Low":
        return "#e5f5e5";
    }
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <EraBackgroundWrapper>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <FlatList
          data={getSortedTasks()}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              <Text style={styles.title}>Planner</Text>

              <Text style={styles.sortLabel}>Sort by:</Text>
              <DropDownPicker
                open={sortOpen}
                value={sortBy}
                items={[
                  { label: "Deadline", value: "deadline" },
                  { label: "Priority", value: "priority" },
                ]}
                setOpen={setSortOpen}
                setValue={setSortBy}
                containerStyle={{ marginBottom: 10 }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
                zIndexInverse={1000}
                dropDownDirection="TOP"
              />

              <Text style={styles.listLabel}>Task List:</Text>

              {tasks.length === 0 && (
                <Text style={styles.emptyText}>
                  No tasks yet — start by adding one!
                </Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                <View
                  style={[
                    styles.taskCard,
                    { backgroundColor: getPriorityColor(item.priority) },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => toggleDone(item.id)}
                    style={[
                      styles.circleButton,
                      item.done && styles.circleButtonDone,
                    ]}
                  >
                    {item.done && <Icon name="check" size={16} color="white" />}
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.taskTitle,
                        item.done && {
                          textDecorationLine: "line-through",
                          color: "#aaa",
                        },
                      ]}
                    >
                      {item.text}
                    </Text>
                    <View style={styles.metaRow}>
                      <Feather name="calendar" size={16} color="#333" style={styles.metaIcon} />
                      <Text style={styles.taskMeta}>Due: {item.dueDate}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <FontAwesome5 name="bullseye" size={16} color="#333" style={styles.metaIcon} />
                      <Text style={styles.taskMeta}>Priority: {item.priority}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteTask(item.id)}
                    style={styles.binButton}
                  >
                    <Icon name="trash-2" size={20} color="#d11a2a" />
                  </TouchableOpacity>
                </View>
              </Swipeable>
            </View>
          )}
          ListFooterComponent={
            <View>
              <TouchableOpacity
                style={styles.newTaskButton}
                onPress={() => setShowAddTask(!showAddTask)}
              >
                <Text style={styles.newTaskButtonText}>
                  {showAddTask ? "Cancel" : "+ New Task"}
                </Text>
              </TouchableOpacity>

              {showAddTask && (
                <View style={styles.inputCard}>
                  <TextInput
                    placeholder="Task description"
                    value={text}
                    onChangeText={setText}
                    style={styles.input}
                  />

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <View style={styles.metaRow}>
                      <Feather name="calendar" size={16} color="#333" style={styles.metaIcon} />
                      <Text style={styles.taskMeta}>Due: {dueDate.toISOString().split("T")[0]}</Text>
                    </View>
                  </TouchableOpacity>

                  <DateTimePickerModal
                    isVisible={showDatePicker}
                    mode="date"
                    date={dueDate}
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onConfirm={(date) => {
                      setDueDate(date);
                      setShowDatePicker(false);
                    }}
                    onCancel={() => setShowDatePicker(false)}
                  />

                  <View style={[styles.metaRow, { marginBottom: 6 }]}>
                    <FontAwesome5 name="bullseye" size={16} color="#333" style={styles.metaIcon} />
                    <Text style={styles.taskMeta}>Priority:</Text>
                  </View>
                  <DropDownPicker
                    open={priorityOpen}
                    value={priority}
                    items={[
                      { label: "Low", value: "Low" },
                      { label: "Medium", value: "Medium" },
                      { label: "High", value: "High" },
                    ]}
                    setOpen={setPriorityOpen}
                    setValue={setPriority}
                    containerStyle={{ marginBottom: 10 }}
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropdownContainer}
                    zIndex={2000}
                    zIndexInverse={1000}
                    dropDownDirection="TOP"
                  />

                  <TouchableOpacity style={styles.addButton} onPress={addTask}>
                    <Text style={styles.addButtonText}>+ Add Task</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          }
        />
      </KeyboardAvoidingView>
    </EraBackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  listLabel: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  inputCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 5 },
  dateButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dateText: { fontSize: 16 },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  addButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  newTaskButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 15,
  },
  newTaskButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  sortLabel: {
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  taskCard: {
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  taskTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  taskMeta: { fontSize: 14, color: "#555" },
  circleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  circleButtonDone: {
    backgroundColor: "#4CAF50",
    borderWidth: 0,
  },
  binButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  metaRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
  },
  metaIcon: {
    marginRight: 6,
  },
});

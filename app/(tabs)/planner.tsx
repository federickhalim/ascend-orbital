import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { ScrollView } from "react-native";

interface Task {
  id: string;
  text: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");
  const [sortBy, setSortBy] = useState<"deadline" | "priority">("deadline");

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    const saved = await AsyncStorage.getItem("plannerTasks");
    if (saved) setTasks(JSON.parse(saved));
  };

  const saveTasks = async () => {
    await AsyncStorage.setItem("plannerTasks", JSON.stringify(tasks));
  };

  const addTask = () => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: text.trim(),
      dueDate: dueDate.toISOString().split("T")[0],
      priority,
    };
    setTasks([...tasks, newTask]);
    setText("");
    setDueDate(new Date());
    setPriority("Low");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Planner</Text>

      <TextInput
        placeholder="Task description"
        value={text}
        onChangeText={setText}
        style={styles.input}
      />

      {Platform.OS === "web" ? (
        <View style={{ marginBottom: 10 }}>
          <Text style={{ marginBottom: 5 }}>Due date:</Text>
          <input
            type="date"
            value={dueDate.toISOString().split("T")[0]}
            onChange={(e) => setDueDate(new Date(e.target.value))}
            style={{
              fontSize: 16,
              padding: 10,
              width: "100%",
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          />
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              Due: {dueDate.toISOString().split("T")[0]}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDueDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      <Picker
        selectedValue={priority}
        onValueChange={(val) => setPriority(val as Task["priority"])}
        style={styles.picker}
      >
        <Picker.Item label="Low Priority" value="Low" />
        <Picker.Item label="Medium Priority" value="Medium" />
        <Picker.Item label="High Priority" value="High" />
      </Picker>

      <Button title="Add Task" onPress={addTask} />

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Sort by:</Text>
      <Picker
        selectedValue={sortBy}
        onValueChange={(val) => setSortBy(val as "deadline" | "priority")}
        style={styles.picker}
      >
        <Picker.Item label="Deadline" value="deadline" />
        <Picker.Item label="Priority" value="priority" />
      </Picker>

      {getSortedTasks().map((item) => (
        <View key={item.id} style={styles.taskContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.taskText}>
              {` ${item.text}\n Due: ${item.dueDate}\n Priority: ${item.priority}`}
            </Text>
          </View>
          <Button title="Delete" onPress={() => deleteTask(item.id)} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dateText: { fontSize: 16 },
  picker: { marginBottom: 10 },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  taskText: { fontSize: 16 },
});

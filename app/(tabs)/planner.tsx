import { Picker } from "@react-native-picker/picker";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  //Picker,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Task {
  id: string;
  text: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    const saved = await AsyncStorage.getItem("plannerTasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  };

  const saveTasks = async () => {
    await AsyncStorage.setItem("plannerTasks", JSON.stringify(tasks));
  };

  const addTask = () => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: text.trim(),
      dueDate: dueDate.trim() || "No due date",
      priority,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setText("");
    setDueDate("");
    setPriority("Low");
  };

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planner</Text>

      <TextInput
        placeholder="Task description"
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <TextInput
        placeholder="Due date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
        style={styles.input}
      />

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

      <FlatList
        data={[...tasks].sort((a, b) => {
          const priorityOrder = { High: 0, Medium: 1, Low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity
              onPress={() => toggleComplete(item.id)}
              style={{ flex: 1 }}
            >
              <Text
                style={item.completed ? styles.completedTask : styles.taskText}
              >
                {item.text} — {item.dueDate} — {item.priority}
              </Text>
            </TouchableOpacity>
            <Button title="Delete" onPress={() => deleteTask(item.id)} />
          </View>
        )}
      />
    </View>
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
  picker: { marginBottom: 10 },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  taskText: { fontSize: 16 },
  completedTask: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "gray",
  },
});

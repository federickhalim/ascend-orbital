import { View, Text, Button } from "react-native";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";

export default function Test() {
  return (
    <View>
      <Text>Testing Auth</Text>
      <Button
        title="Try getAuth"
        onPress={() => {
          try {
            const auth = getAuth(app);
            console.log("Auth is:", auth);
          } catch (e) {
            console.log("Error:", e);
          }
        }}
      />
    </View>
  );
}

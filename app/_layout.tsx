import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/components/useColorScheme";
import { preloadAssets } from "@/utils/preloadAssets";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const FIREBASE_API_KEY = "AIzaSyC6kcCBZoQGxuFAv7VVlY674Ul7C9dyNwU";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error("Font load error:", error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    const loadResourcesAndCheckAuth = async () => {
      try {
        console.log("🔄 Preloading assets...");
        await preloadAssets();
        console.log("✅ Assets preloaded");

        const idToken = await AsyncStorage.getItem("userToken");
        const userId = await AsyncStorage.getItem("userId");
        console.log("📦 Retrieved from storage:", { idToken, userId });

        if (!idToken || !userId) {
          console.log("🚫 Missing token or userId. Redirecting to login...");
          await AsyncStorage.multiRemove(["userId", "userToken"]);
          setTimeout(() => {
            router.replace("/(auth)/login");
          }, 0);

          return;
        }

        console.log("🔐 Verifying token with Firebase...");
        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(
            "❌ Invalid token. Firebase says:",
            data.error?.message
          );
          await AsyncStorage.multiRemove(["userId", "userToken"]);
          console.log("🔁 Redirecting to login...");
          setTimeout(() => {
            router.replace("/(auth)/login");
          }, 0);

          return;
        }

        console.log("✅ Token is valid. Continuing to tabs.");
      } catch (e) {
        console.error("🔥 Auth check failed:", e);
        await AsyncStorage.multiRemove(["userId", "userToken"]);
        console.log("🔁 Redirecting to login (from catch block)...");
        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 0);
      } finally {
        setCheckingAuth(false);
        console.log("🟢 Finished auth check. Hiding splash.");
        SplashScreen.hideAsync();
      }
    };

    if (loaded) {
      console.log("🎉 Fonts loaded. Starting init.");
      loadResourcesAndCheckAuth();
    } else {
      console.log("⏳ Waiting for fonts...");
    }
  }, [loaded]);

  if (!loaded || checkingAuth) {
    console.log("⏳ App is still initializing...");
    return null; // or return <Text>Loading...</Text>
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}

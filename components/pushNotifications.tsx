import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerExpoTokenWithNovu } from "./novu";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      console.log("Permission not granted for push notifications");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    alert("Must use physical device for Push Notifications");
    console.log("Not a physical device, cannot get push token");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
    console.log("Android notification channel set");
  }

  return token;
}

export async function registerAndSyncPushToken(
  subscriberId: string,
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }
) {
  console.log("Starting push token registration for subscriber:", subscriberId);
  try {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      console.log("Registering token with Novu...");
      await registerExpoTokenWithNovu(subscriberId, token, userData);
      console.log("Successfully registered token with Novu");
    } else {
      console.log("No token received, skipping Novu registration");
    }
    return token;
  } catch (error) {
    console.log("Error during push token registration or Novu sync:", error);
    throw error;
  }
}

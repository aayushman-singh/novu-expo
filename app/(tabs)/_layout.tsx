import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerExpoTokenWithNovu } from "@/components/novu";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";

const useUnreadCount = () => {
  return 5; // Example: 5 unread messages
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  showBadge?: boolean;
  badgeCount?: number;
}) {
  return (
    <View>
      <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
      {props.showBadge && props.badgeCount && props.badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{props.badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permission not granted for push notifications");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    console.log("Not a physical device, cannot get push token");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
    console.log("Android notification channel set");
  }

  return token;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const unreadCount = useUnreadCount();

  useEffect(() => {
    console.log("0. TabLayout useEffect started");
    
    async function setupPushNotifications() {
      console.log("1. Inside setupPushNotifications");
      
      try {
        console.log("2. Starting push notification setup...");
        const subscriberId = "aayushman-027";
        
        console.log("3. About to call registerForPushNotificationsAsync");
        const token = await registerForPushNotificationsAsync();
        console.log("4. After registerForPushNotificationsAsync, token:", token);
        
        if (token) {
          console.log("5. Got token, about to call registerExpoTokenWithNovu");
          await registerExpoTokenWithNovu(subscriberId, token);
          console.log("6. Successfully registered with Novu");
        } else {
          console.log("5b. Token was null or undefined");
        }
        
        console.log("7. Finished setupPushNotifications");
      } catch (error: any) {
        console.error("8. Top level error in setupPushNotifications:", error.message);
      }
    }

    setupPushNotifications();

    const subscriptionReceived = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const subscriptionResponse =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification clicked:", response);
      });

    return () => {
      subscriptionReceived.remove();
      subscriptionResponse.remove();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Changelog",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="UpdatesScreen"
        options={{
          title: "Updates",
          tabBarIcon: ({ color }) => (
            <TabBarIcon
              name="bell"
              color={color}
              showBadge={true}
              badgeCount={unreadCount}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

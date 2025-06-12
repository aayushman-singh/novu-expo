import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";

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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const unreadCount = useUnreadCount();

  useEffect(() => {
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

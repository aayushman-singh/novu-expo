import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { View } from '@/components/Themed';
import PostItem from '@/components/PostItem';
import { registerForPushNotificationsAsync } from '@/components/pushNotifications';
import { Text } from '@/components/Themed';
// Update the Post interface
interface Post {
  title: string;
  url: string;
  imageUrl: string;
  content: string;
  date: string;
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);


  return (
    <View style={styles.container}>
      <Text>Hello from Expo Router</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
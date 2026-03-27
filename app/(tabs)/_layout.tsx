import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // This hides the tab bar
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
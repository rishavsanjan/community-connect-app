import { Text, View } from "react-native";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Checkbox } from "react-native-paper";
import Ionicons from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import toastConfig from './Toast.config()';


import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import RequestScreen from "./screens/RequestScreen";
import ResourcesScreen from "./screens/ResourcesScreen";
import ResourceDetailScreen from "./screens/ResourceDetailsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ConnectionRequestsScreen from "./screens/ConnectionRequestsScreen";
import UserInfo from "./screens/UserInfoScreen";
import MessagesScreen from "./screens/MessagesScreen"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={ConnectionRequestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Request"
        component={RequestScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Index() {
  return (
    <>
      <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Main" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ResourceDetails" component={ResourceDetailScreen} />
        <Stack.Screen name="UserInfo" component={UserInfo} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
      </Stack.Navigator>
      <Toast config={toastConfig}/>
    </>
  );
}

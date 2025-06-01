import { useState } from "react";
import { Text, TextInput, TextInputComponent, Switch, TouchableOpacity, View } from "react-native";
import { Checkbox } from 'react-native-paper';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';


export default function LoginScreen({ navigation }) {
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/login' : 'http://localhost:5000/login';
  const handleLogin = async () => {
    try {

      console.log("Platform:", Platform.OS, "Base URL:", baseURL);


      const response = await axios.post(`${baseURL}`, {
        email: email,
        password: password
      });
      console.log('hello')

      if (Platform.OS === 'web') {
        localStorage.setItem('token', response.data.token);
      } else {
        await AsyncStorage.setItem('token', response.data.token);
      }

      console.log("Token saved:", response.data.token);

      Toast.show({
        type: 'success',
        text1: 'Logged In Successfully',
        position: 'top'
      });
      navigation.navigate("Main");

    } catch (err) {
      console.log(err)
      if (err.response?.status === 409) {
        Toast.show({
          type: 'error',
          text1: `${err.response.data.message}`,
          position: 'top'
        });
        setError(err.response.data.message);
      } else {
        Toast.show({
          type: 'error',
          text1: `${err.response.data.message || "Something went wrong"}`,
          position: 'top'
        });
      }
    }
  };

  return (
    <View className="flex flex-col gap-4 m-4 p-8 border shadow-xl backdrop-blur-md items-center justify-center bg-white">
      <Text className="text-3xl font-bold">Welcome Back</Text>
      <Text className="text-gray-500">Log in to access community resources</Text>
      {error && <Text className="bg-red-200 border border-red-500 p-2 rounded-xl">{error}</Text>}
      <View className="flex gap-5 justify-start w-full">
        <View className="flex gap-2">
          <Text className="font-bold text-lg">Email Address</Text>
          <TextInput onChangeText={(text) => setEmail(text)} placeholder="Enter your email" className="pl-4 border rounded-md border-gray-400"></TextInput>
        </View>
        <View className="flex gap-2">
          <Text className="font-bold text-lg">Password</Text>
          <TextInput onChangeText={(text) => setPassword(text)} placeholder="Enter your password" className="pl-4 border rounded-md border-gray-400"></TextInput>
        </View>

        <View className="flex gap-2">
          <View className="flex flex-row items-center -mx-2">
            <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} />
            <Text className="font-semibold">Remeber Me</Text>
          </View>
          <View className="">
            <TouchableOpacity onPress={() => { handleLogin(); }} className="bg-blue-500 rounded-lg w-full flex flex-row justify-center">
              <Text className="text-white p-2 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Text>Don't have an account ?<Text onPress={() => navigation.navigate("SignUp")} className="text-blue-500"> Register</Text> </Text>


    </View>
  );
}

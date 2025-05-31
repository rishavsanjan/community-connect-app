import { useEffect, useState } from "react";
import { Text, TextInput, TextInputComponent, Switch, TouchableOpacity, View, FlatList, Image, ScrollView } from "react-native";
import { Checkbox } from 'react-native-paper';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { ImageBackground } from 'react-native';


export default function UserInfoScreen({ navigation, route }) {
    const { id } = route.params;
    const [userInfo, setUserInfo] = useState([]);
    const [loggedInId, setLoggedInId] = useState([]);
    const [status, setStatus] = useState('');

    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

    useEffect(() => {
        const token = AsyncStorage.getItem('token');
        const fetchLoggedInId = async () => {
            const response = await fetch(`${baseURL}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            })
            const data = await response.json();
            setLoggedInId(data);
        }


        fetchLoggedInId();
        const fetchProfile = async () => {
            const response = await fetch(`${baseURL}/fetchusername/${id}`);
            const data = await response.json();

            setUserInfo(data.todo);

        };


        fetchProfile();
    }, [])
    console.log(userInfo.backPic)

    return (
        <ScrollView>
            <ImageBackground source={{uri:`${userInfo.backPic}`}} resizeMethod="cover" className="flex-1 items-center justify-center">
                <View style={{ backgroundColor: 'transparent' }} className="p-8 flex items-center gap-2">
                    <Image style={{ height: 120, width: 120 }} className="border-4 rounded-full border-white" source={{ uri: `${userInfo.profilePic}` }} />
                    <Text className="text-white font-medium text-3xl">{userInfo.firstName + ' ' + userInfo.lastName}</Text>
                    <Text className="text-lg text-white">Jammu</Text>
                    <TouchableOpacity className="bg-green-300/30 p-2 px-4 rounded-xl">
                        <Text className="text-green-400">Connected</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <View className="p-6 bg-white flex gap-8">
                <View className="flex flex-row items-center gap-4">
                    <View className="bg-blue-500 p-2 rounded-xl">
                        <Image style={{ height: 15, width: 15 }} source={{ uri: 'https://img.icons8.com/?size=100&id=77&format=png&color=000000' }} />
                    </View>
                    <Text className="text-xl font-medium">Personal Information</Text>
                </View>
                <View className="bg-gray-100 p-4 rounded-xl border-l-4 border-blue-500">
                    <Text className="text-gray-500">NAME</Text>
                    <Text className="text-blue-500 text-lg">{userInfo.firstName + ' ' + userInfo.lastName}</Text>
                </View>
                <View className="bg-gray-100 p-4 rounded-xl border-l-4 border-blue-500">
                    <Text className="text-gray-500">EMAIL ADDRESS</Text>
                    <Text className="text-blue-500 text-lg">{userInfo.email}</Text>
                </View>
                <View className="bg-gray-100 p-4 rounded-xl border-l-4 border-blue-500">
                    <Text className="text-gray-500">PHONE NUMBER</Text>
                    <Text className="text-blue-500 text-lg">{userInfo.phoneNumber}</Text>
                </View>
                <View className="bg-gray-100 p-4 rounded-xl border-l-4 border-blue-500">
                    <Text className="text-gray-500">ACCOUNT STATUS</Text>
                    <Text className="text-blue-500 text-lg">{userInfo.verified ? 'Verified' : 'Not Verified'}</Text>
                </View>
            </View>
            <View className="p-6 bg-white flex gap-8">
                <View className="flex flex-row items-center gap-4">
                    <View className="bg-blue-500 p-2 rounded-xl">
                        <Image style={{ height: 15, width: 15 }} source={{ uri: 'https://img.icons8.com/?size=100&id=19326&format=png&color=000000' }} />
                    </View>
                    <Text className="text-xl font-medium">Location</Text>
                </View>
                <View className="bg-gray-100 p-4 rounded-xl border-l-4 border-blue-500">
                    <Text className="text-gray-500">Location</Text>
                    <Text className="text-blue-500 text-lg">Jammu</Text>
                </View>
                <View className="bg-gray-100 p-4 rounded-xl border-l-4 border-blue-500">
                    <Text className="text-gray-500">ZIPCODE</Text>
                    <Text className="text-blue-500 text-lg">{userInfo.zipCode}</Text>
                </View>
            </View>
        </ScrollView>
    )
}
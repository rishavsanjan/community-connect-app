import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView, Pressable, FlatList } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Platform } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileNotLogged from './ProfileNotLogged';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import Lottie from 'lottie-react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';





import Toast from 'react-native-toast-message';

export default function ConnectionsScreen({ navigation }) {

    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';


    const [connectionsList, setConnectionsList] = useState([]);
    const [userId, setUserId] = useState('');

    const fetchConnections = async () => {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${baseURL}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const data = await response.json();

            setUserId(data.userId);

            const usersList = {};
            await Promise.all(data.connections.map(async (conn) => {
                const res = await fetch(`${baseURL}/connectionsenderdata/${conn.userId}`, {
                    method: 'GET'
                })
                const senderInfo = await res.json();
                usersList[conn.userId] = senderInfo.msg;
            }));
            setConnectionsList(usersList);

        }
    useEffect(() => {
        
        fetchConnections();
    }, [])

    console.log(connectionsList);
    async function disconnect(deleteId) {
        const resposne = await fetch(`${baseURL}/disconnect/${userId}/${deleteId}`, {
            method: 'PUT'
        });
        console.log('hello')

        const data = await resposne.json();

        console.log(data);
        setConnectionsList(prev => {
            const updatedList = { ...prev };
            delete updatedList[deleteId];
            return updatedList;
        });
        
        fetchConnections();
        Toast.show({
            type: 'success',
            text1: 'Connection Removed!',
            position: 'top'
        });

    }

    console.log(connectionsList)



    const renderList = ({ item }) => {
        return (
            <View className="p-6">
                <View className="flex flex-col bg-white p-6 gap-4 rounded-xl border-t-4 border-blue-600">
                    <View className="flex flex-row items-center gap-4">
                        <Image style={{ height: 60, width: 60 }} source={{ uri: `${item.profilePic}` }} />
                        <View>
                            <Text className="font-medium text-2xl">{item.firstName + ' ' + item.lastName}</Text>
                            <Text className="text-gray-500 text-md">{item.connections.length + ' ' + 'connections'}</Text>
                        </View>
                    </View>

                    <View className="flex flex-row justify-between">
                        <LinearGradient style={{ borderRadius: 30 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#0EB27C', '#0CAC78', '#079D6E']}>
                            <TouchableOpacity className="p-4 px-10 ">
                                <Text className="text-white font-semibold text-xl">
                                    Message
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>

                        <LinearGradient style={{ borderRadius: 30, borderColor: 'grey', borderWidth: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#ff8282', '#ff8282', '#ff8282']}>
                            <TouchableOpacity onPress={() => disconnect(item._id)} className="p-4 px-10 ">
                                <Text className="text-black font-semibold text-xl">
                                    Disconnect
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                </View>


            </View>
        )
    }

    return (
        <>
            <LinearGradient colors={['#48B2FE', '#2FC8FE', '#2DE2FE']} style={{ padding: 24, paddingTop: 48, paddingBottom: 48 }}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: 'white' }}>Connections
                </Text>
                <Text style={{ color: 'white', fontSize: 17 }}>{ } Manage your  network
                </Text>
            </LinearGradient>
            <View className='p-4'>
                <TextInput activeUnderlineColor='transparent' underlineColor='transparent' style={{ backgroundColor: 'white', borderRadius: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30 }} className='border rounded-full' placeholder='Search here...'></TextInput>
            </View>
            <View>
                <FlatList data={Object.values(connectionsList)} renderItem={renderList} keyExtractor={item => item._id.toString()} />
            </View>
        </>
    )
}
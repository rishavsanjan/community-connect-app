import { useEffect, useState } from "react";
import { Text, TextInput, TextInputComponent, Switch, TouchableOpacity, View, FlatList, Image, ScrollView } from "react-native";
import { Checkbox } from 'react-native-paper';
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';





export default function ConnectionRequestScreen() {

    const [sender, setSenders] = useState([]);
    const [user, setUser] = useState([]);
    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

    const getConnectionRequests = async () => {
        console.log('updated')
        let token;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('token');
        } else {
            token = await AsyncStorage.getItem('token');
        }
        const response = await fetch(`${baseURL}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })

        const data = await response.json();

        setUser(data);

        const senderList = await Promise.all(
            data.connectionsRequests.map(async (conn) => {
                const res = await fetch(`${baseURL}/connectionsenderdata/${conn.userId}`);
                const senderInfo = await res.json();
                return {
                    _id: conn.userId,
                    ...senderInfo.msg 
                };
            })
        );
        setSenders(senderList);
    }


    useEffect(() => {
        getConnectionRequests();
    }, [])


    function requestAccepted(id) {
        const acceptRequest = async () => {

            let token;
            if (Platform.OS === 'web') {
                token = localStorage.getItem('token');
            } else {
                token = await AsyncStorage.getItem('token');
            }
            const response = await fetch(`${baseURL}/acceptrequest/${id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            await getConnectionRequests();
        }

        Toast.show({
            type: 'success',
            text1: 'Request Accepted',
            position: 'top'
        });
        acceptRequest();
        
    }

    function declineRequest(id) {
        const requestDeclined = async () => {
            let token;
            if (Platform.OS === 'web') {
                token = localStorage.getItem('token');
            } else {
                token = await AsyncStorage.getItem('token');
            }
            const response = await fetch(`${baseURL}/declinerequest/${id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
            await getConnectionRequests();
        }
        console.log('hello')
        Toast.show({
            type: 'decline',
            text1: 'Request Rejected',
            position: 'top'
        });
        requestDeclined();
    }
    const renderRequest = ({ item }) => {
        return (
            <View className="p-6">
                <View className="flex flex-col bg-white p-6 gap-4 rounded-xl border-t-4 border-blue-600">
                    <View className="flex flex-row items-center gap-4">
                        <Image style={{ height: 60, width: 60 }} source={{ uri: `${item.profilePic}` }} />
                        <View>
                            <Text className="font-medium text-2xl">{item.firstName + ' ' + item.lastName}</Text>
                            <Text className="text-gray-500 text-md">{item.role === null ? 'New Member' : `${item.role}`}</Text>
                        </View>
                    </View>

                    <View className="flex flex-row justify-between">
                        <LinearGradient style={{ borderRadius: 10 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#0EB27C', '#0CAC78', '#079D6E']}>
                            <TouchableOpacity onPress={() => requestAccepted(item._id)} className="p-4 px-10">
                                <Text className="text-white font-semibold text-xl">
                                    Accept
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>

                        <LinearGradient style={{ borderRadius: 10, borderColor: 'grey', borderWidth: 1 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#F1F5F9', '#F1F5F9']}>
                            <TouchableOpacity onPress={() => declineRequest(item._id)} className="p-4 px-10">
                                <Text className="text-black font-semibold text-xl">
                                    Decline
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                </View>


            </View>
        )
    }
    return (
        <View>
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="" colors={['#4c669f', '#3b5998', '#192f6a']}>
                <View className="flex justify-center items-center p-12 h-48 gap-1">
                    <Text className="text-3xl font-medium text-white">Connection Requests</Text>
                    <Text className="text-white">Manage your incoming connection requests</Text>
                </View>
            </LinearGradient>
            <View className="flex flex-row items-center gap-4 p-6 bg-white border-b border-gray-400">
                <Text className="text-2xl">Pending Requests</Text>
                <Text className="bg-red-500 text-white p-1 rounded-xl w-6 text-center">{sender?.length || 0}</Text>
            </View>
            <View>
                <FlatList data={sender} renderItem={renderRequest} keyExtractor={item => item._id.toString()} />
            </View>
        </View>

    )
}
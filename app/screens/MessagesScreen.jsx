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
import io from 'socket.io-client/dist/socket.io.js';
const socket = io('http://10.0.2.2:5000');


export default function MessagesScreen() {
    const [isChatSelected, setIsChatSelected] = useState(false);
    const [chatSelect, setChatSelected] = useState([]);
    const [chat, setChat] = useState([]);
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState();

    const [sentTo, setSentTo] = useState([]);
    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

    const fetchMessages = async () => {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${baseURL}/messages`, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token
            }
        })
        const data = await response.json();
        console.log(data.senderId)
        console.log(data.msg)
        setUserId(data.senderId);

        const latestMessages = {};
        const senderData = {};

        for (let conn of data.msg) {
            const otherUser = conn.receiver === data.senderId ? conn.sender : conn.receiver;

            if (!latestMessages[otherUser] || new Date(conn.timestamp) > new Date(latestMessages[otherUser].timestamp)) {
                latestMessages[otherUser] = conn;
            }
        }

        await Promise.all(Object.keys(latestMessages).map(async (userId) => {
            const res = await fetch(`${baseURL}/connectionsenderdata/${userId}`, {
                method: 'GET'
            });
            const senderInfo = await res.json();
            senderData[userId] = {
                ...senderInfo.msg,
                latestMessage: latestMessages[userId].message,
                timestamp: latestMessages[userId].timestamp
            };
        }));
        setSentTo(Object.values(senderData));

    }
    useEffect(() => {

        fetchMessages();
    }, [])

    async function SelectChat(receiverInfo) {
        setChatSelected(receiverInfo);
        setReceiverId(receiverInfo._id);
        const response = await fetch(`${baseURL}/messages/${userId}/${receiverInfo._id}`);
        const messages = await response.json();
        const formatted = messages.map((msg) => ({
            ...msg,
            self: msg.sender === userId
        }));
        setChat(formatted);
    }

    function msgTime(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    useEffect(() => {
        if (!userId) return;

        socket.emit('join', userId);

        socket.on('receive_private_message', (data) => {
            setChat((prev) => [...prev, { ...data, self: false }])
        });
        return () => {
            socket.off('receive_private_message');
        }
    }, [userId])

    const sendMessage = () => {
        socket.emit('send_private_message', {
            to: receiverId,
            from: userId,
            message
        });
        setChat((prev) => [...prev, { message, from: userId, self: true }]);
        setMessage('');
        fetchMessages();
    };

    function timeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diff = Math.floor((now - past) / 1000); // in seconds

        if (diff < 60) {
            return `just now`;
        } else if (diff < 3600) {
            const mins = Math.floor(diff / 60);
            return `${mins}m ago`;
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diff / 86400);
            return `${days}d ago`;
        }
    }

    const renderChatters = ({ item }) => {
        return (
            <>
                <TouchableOpacity onPress={() => { setIsChatSelected(true); SelectChat(item) }} className='flex flex-row justify-between items-center p-4 bg-white'>
                    <View className='flex flex-row items-center gap-4'>
                        <Image style={{ height: 50, width: 50 }} source={{ uri: `${item.profilePic}` }} />
                        <View className='flex'>
                            <Text className='font-medium'>{item.firstName + ' ' + item.lastName}</Text>
                            <Text className='text-gray-600'>{item.latestMessage}</Text>
                        </View>
                    </View>
                    <View>
                        <Text className='text-gray-600'>{msgTime(item.timestamp)}</Text>
                    </View>
                </TouchableOpacity>
                <View style={{
                    height: 1,
                    backgroundColor: '#E0E0E0',
                    marginVertical: 2,
                    opacity: 0.6,
                }}></View>
            </>

        )
    }

    return (
        <>
            {isChatSelected === false ? <View className='bg-white'>
                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="" colors={['#6665F1', '#7561F3', '#7E5FF5']}>
                    <View className="flex justify-start items-start p-12 h-48 gap-1">
                        <Text className="text-4xl font-semibold text-white">Messages</Text>
                        <Text className="text-white">{sentTo?.length || 0}  conversations</Text>
                    </View>
                </LinearGradient>
                <View style={{ paddingTop: 30 }} className='p-4'>
                    <TextInput style={{ backgroundColor: '#E1E1E1', borderRadius: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30 }} placeholder='Search messages' mode='flat' underlineColor='transparent' activeUnderlineColor='transparent' ></TextInput>
                </View>
                
                <FlatList data={sentTo} renderItem={renderChatters} keyExtractor={item => item._id.toString()} />
            </View> :
                <>
                    <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="" colors={['#6665F1', '#7561F3', '#7E5FF5']}>
                        <View className='flex flex-row items-center p-4 gap-8 px-8'>
                            <TouchableOpacity onPress={() => setIsChatSelected(false)}>
                                <Image style={{ height: 40, width: 40 }} source={{ uri: 'https://img.icons8.com/?size=100&id=357&format=png&color=000000' }} />
                            </TouchableOpacity>
                            <View className='flex flex-row items-center gap-4'>
                                <Image style={{ height: 50, width: 50 }} source={{ uri: `${chatSelect.profilePic}` }} />
                                <Text>{chatSelect.firstName + ' ' + chatSelect.lastName}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                    {console.log(chat)}
                </>

            }
        </>
    )
}
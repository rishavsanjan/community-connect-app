import { useEffect, useState } from 'react';
import {
    Image, Text, TouchableOpacity, View, FlatList, SafeAreaView, Pressable
} from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import io from 'socket.io-client/dist/socket.io.js';
import { useRef } from 'react';

const socket = io('http://10.0.2.2:5000', { transports: ['websocket'] });

export default function MessagesScreen() {
    const [isChatSelected, setIsChatSelected] = useState(false);
    const [chatSelect, setChatSelected] = useState(null);
    const [chat, setChat] = useState([]);
    const [userId, setUserId] = useState('');
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [sentTo, setSentTo] = useState([]);

    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
    const flatListRef = useRef();


    const fetchMessages = async () => {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${baseURL}/messages`, {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        setUserId(data.senderId);

        const latestMessages = {};
        const senderData = {};

        for (let conn of data.msg) {
            const otherUser = conn.receiver === data.senderId ? conn.sender : conn.receiver;
            if (!latestMessages[otherUser] || new Date(conn.timestamp) > new Date(latestMessages[otherUser].timestamp)) {
                latestMessages[otherUser] = conn;
            }
        }

        await Promise.all(Object.keys(latestMessages).map(async (uid) => {
            const res = await fetch(`${baseURL}/connectionsenderdata/${uid}`);
            const info = await res.json();
            senderData[uid] = {
                ...info.msg,
                latestMessage: latestMessages[uid].message,
                timestamp: latestMessages[uid].timestamp
            };
        }));

        setSentTo(Object.values(senderData));
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (!userId) return;
        socket.emit('join', userId);
        socket.on('receive_private_message', (data) => {
            setChat((prev) => [...prev, { ...data, self: false }]);
        });
        return () => socket.off('receive_private_message');
    }, [userId]);

    const SelectChat = async (receiverInfo) => {
        setChatSelected(receiverInfo);
        setReceiverId(receiverInfo._id);
        setIsChatSelected(true);

        const res = await fetch(`${baseURL}/messages/${userId}/${receiverInfo._id}`);
        const data = await res.json();
        const formatted = data.map((msg) => ({
            ...msg,
            self: msg.sender === userId
        }));
        setChat(formatted);
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit('send_private_message', { to: receiverId, from: userId, message });
        setChat(prev => [...prev, { message, from: userId, self: true, timestamp: new Date() }]);
        setMessage('');
        fetchMessages();
    };

    const msgTime = (timestamp) => {
        const date = new Date(timestamp);
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const renderChatters = ({ item }) => (
        <TouchableOpacity
            onPress={() => SelectChat(item)}
            style={{ flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white' }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={{ uri: item.profilePic }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <View>
                    <Text style={{ fontWeight: 'bold' }}>{item.firstName} {item.lastName}</Text>
                    <Text style={{ color: '#777' }}>{item.latestMessage}</Text>
                </View>
            </View>
            <Text style={{ color: '#888' }}>{msgTime(item.timestamp)}</Text>
        </TouchableOpacity>
    );

    const renderChat = ({ item }) => (
        <View style={{ alignItems: item.self ? 'flex-end' : 'flex-start', marginVertical: 4 }}>
            <View style={{
                backgroundColor: item.self ? '#3797F0' : '#ccc',
                padding: 10,
                borderRadius: 20,
                maxWidth: '75%',
            }}>
                <Text style={{ color: item.self ? 'white' : 'black' }}>{item.message}</Text>
                <Text style={{ fontSize: 10, color: item.self ? '#eee' : '#333', textAlign: 'right' }}>{msgTime(item.timestamp)}</Text>
            </View>
        </View>
    );

    if (!isChatSelected) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                <LinearGradient colors={['#6665F1', '#7561F3', '#7E5FF5']} style={{ padding: 24, paddingTop: 48 }}>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Messages</Text>
                    <Text style={{ color: 'white' }}>{sentTo.length} conversations</Text>
                </LinearGradient>
                <FlatList
                    data={sentTo}
                    keyExtractor={item => item._id.toString()}
                    renderItem={renderChatters}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
                />
            </SafeAreaView>
        );
    }
    console.log(message)
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <LinearGradient colors={['#6665F1', '#7561F3', '#7E5FF5']} style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setIsChatSelected(false)} style={{ marginRight: 12 }}>
                    <Image source={{ uri: 'https://img.icons8.com/?size=100&id=357&format=png&color=000000' }} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
                <Image source={{ uri: chatSelect?.profilePic }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                <Text style={{ color: 'white', fontSize: 16 }}>{chatSelect?.firstName} {chatSelect?.lastName}</Text>
            </LinearGradient>

            <View style={{ flex: 1, padding: 10 }}>
                <FlatList
                    ref={flatListRef}
                    data={chat}
                    renderItem={renderChat}
                    keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                />

            </View>

            <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder='Enter message'
                    style={{ flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16 }}
                />
                <Pressable onPress={sendMessage} style={{ backgroundColor: 'blue', padding: 12, borderRadius: 10, marginLeft: 8 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

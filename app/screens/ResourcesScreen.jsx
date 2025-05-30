import { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Platform } from 'react-native';

import HeaderScreen from './HeaderScreen'

export default function Resources({ navigation }) {
    const [filter, setFilter] = useState('all');
    const [resource, setResource] = useState([]);


    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

    const fetchResource = async () => {
        try {
            const response = await fetch(`${baseURL}/resourcerequest`);
            const data = await response.json();

            const response2 = await fetch(`${baseURL}/resourceupload`);
            const data2 = await response2.json();
            setResource([...data.todo, ...data2.todo]);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };

    useEffect(() => {
        fetchResource();
    }, [])


    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count > 0) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }

        return "just now";
    }

    const renderResource = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('ResourceDetails', { id: item._id })} className="flex flex-col gap-1 p-4 border rounded-xl my-2 bg-white">
                <View className="flex flex-row justify-between items-center">
                    <Text className="text-black font-semibold text-xl">{item.resourceType}</Text>
                    <Text className={`${item.resourcePriority == 'Medium Priority' && 'bg-yellow-400 border-yellow-600'}
                    ${item.resourcePriority == 'Low Priority' && 'bg-green-400 border-green-600'}
                     ${item.resourcePriority == 'High Priority' && 'bg-red-400 border-red-600'}
                     text-white border  p-2 rounded-xl`}>{item.resourcePriority}</Text>
                </View>
                <View className="gap-1">
                    <Text className="text-2xl font-semibold">{item.resourceTitle}</Text>
                    <Text className="text-gray-600 text-lg">{item.resourceDescription}</Text>
                </View>
                <View className="flex flex-row justify-between">
                    <View className="flex flex-row items-center">
                        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=13800&format=png&color=000000' }} className="w-4 h-4" />
                        <Text className="text-gray-700 font-semibold">{item.resourceLocation}</Text>
                    </View>

                    <Text className="text-gray-600 bg-gray-200 p-2 rounded-2xl font-semibold text-sm">{timeAgo(item.createdAt)}</Text>
                </View>
                <View className="flex flex-row justify-start gap-6">
                    <View className="flex flex-row items-center bg-gray-200 p-2 rounded-xl gap-2 px-4">
                        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=11036&format=png&color=000000' }} className="w-6 h-6" />
                        <Text className="text-gray-600">{item.votes.length}</Text>
                    </View>
                    <View className="flex flex-row bg-gray-200 rounded-xl gap-2 items-center px-4">
                        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=38977&format=png&color=000000' }} className="w-6 h-6" />
                        <Text className="text-gray-600">{item.comment.length}</Text>
                    </View>

                </View>
            </TouchableOpacity>
        );
    };


    return (
        <>
            <HeaderScreen />
            <View className="flex flex-1 gap-4  m-4 p-4 rounded-xl  border">
                <View className="flex   justify-between flex-row ">
                    <Pressable onPress={() => { setFilter('all'); fetchResource() }} className={`${filter === 'all' ? 'bg-blue-500' : 'bg-gray-300'} p-2 rounded-3xl px-4`}>
                        <Text className={`${filter === 'all' ? 'text-white' : ' text-gray-600'}  font-bold`}>All</Text>
                    </Pressable>
                    <Pressable
                        onPress={async () => {
                            setFilter('requested');
                            const response = await fetch(`${baseURL}/resourcerequest`);
                            const data = await response.json();
                            setResource(data.todo);
                        }}
                        className={`${filter === 'requested' ? 'bg-blue-500' : 'bg-gray-300'} p-2 rounded-3xl px-4`}>
                        <Text className={`${filter === 'requested' ? 'text-white' : ' text-gray-600'}  font-bold`}>Requested</Text>
                    </Pressable>
                    <Pressable
                        onPress={async () => {
                            setFilter('available');
                            const response = await fetch(`${baseURL}/resourceupload`);
                            const data = await response.json();
                            setResource(data.todo);
                        }}
                        className={`${filter === 'available' ? 'bg-blue-500' : 'bg-gray-300'} p-2 rounded-3xl px-4`}>
                        <Text className={`${filter === 'available' ? 'text-white' : ' text-gray-600'}  font-bold`}>Available</Text>
                    </Pressable>
                </View>
                <View>
                    <View>
                        <Text className="text-3xl font-bold">All Resources</Text>
                    </View>
                    <View>
                        <FlatList data={resource} renderItem={renderResource} keyExtractor={item => item._id.toString()} />
                    </View>
                </View>
            </View>

        </>


    )
}
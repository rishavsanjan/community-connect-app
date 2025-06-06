import { Route } from "expo-router/build/Route";
import { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function ResourceDetaiLScreen({ navigation, route }) {

    const [resource, setResource] = useState([]);
    const [formattedDate, setFormattedDate] = useState('');
    const [username, setUserName] = useState('');
    const [comment, setComment] = useState('');
    const [fetchedComment, setFetchedComment] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [commentAdded, setCommentAdded] = useState('');
    const [commenterId, setCommenterId] = useState('');
    const { id } = route.params;

    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';


    useEffect(() => {
        const fetchResource = async () => {
            const response = await fetch(`${baseURL}/resourcedetails/${id}`);
            const data = await response.json();

            setResource(data.todo);
            setFetchedComment(data.todo.comment);

            if (data.todo && data.todo.createdAt) {
                const date = new Date(data.todo.createdAt);
                setFormattedDate(date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }));
            }

            const fetchUserName = async () => {
                const response2 = await fetch(`${baseURL}/fetchusername/${data.todo.userId}`);
                const data2 = await response2.json();
                setUserName(data2.todo);
            }
            fetchUserName();


            const userData = {};
            await Promise.all(data.todo.comment.map(async (conn) => {
                const res = await fetch(`${baseURL}/connectionsenderdata/${conn.userId}`, {
                    method: 'GET'
                })
                const senderInfo = await res.json();
                userData[conn.userId] = senderInfo.msg;
            }));
            setUserInfo(userData);
        }

        fetchResource();

        const commenterUserName = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': "application/json",
                    'Authorization': 'Bearer ' + token
                }
            })
            const data = await response.json();
            setCommenterId(data);
        }
        commenterUserName();
    }, []);


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
    console.log(fetchedComment)

    async function addComment() {
        console.log('hello')
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${baseURL}/addingcomment/${resource._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': "application/json",
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                commentDescription: comment
            })
        })
        Toast.show({
            type: 'success',
            text1: 'Commet Added Successfully!',
            position: 'top'
        });
        setComment('');
        setCommentAdded('Comment Added Succesfully!');
        setFetchedComment(prev => [...prev, { userId: commenterId.userId, commentDescription: comment }]);
    }


    return (
        <ScrollView>
            <View className="flex gap-4 p-3 m-4 border rounded-2xl">
                <View className="flex  items-center gap-1">
                    <Text className="text-black font-bold text-2xl ">{resource.resourceType}</Text>
                    <View className="flex flex-row items-center gap-2">
                        <Text className={`${resource.resourcePriority == 'Medium Priority' && 'bg-yellow-200'}
                    ${resource.resourcePriority == 'Low Priority' && 'bg-green-200 '}
                     ${resource.resourcePriority == 'High Priority' && 'bg-red-200 '}
                     text-red-600 font-bold px-3 p-2 rounded-3xl`}>{resource.resourcePriority}</Text>
                        <Text className=" font-semibold text-xl text-blue-500 bg-blue-200 px-3 py-1 rounded-3xl">{resource.status}</Text>
                    </View>
                </View>
                <View className="flex flex-row gap-5 justify-center bg-gray-200 p-2 rounded-xl">
                    <View className="items-center">
                        <Text className="font-bold text-xl ">{resource.votes?.length || 0}</Text>
                        <Text className="text-gray-600">Votes</Text>
                    </View>
                    <View className="items-center">
                        <Text className="font-bold text-xl ">{resource.comment?.length || 0}</Text>
                        <Text className="text-gray-600">Comments</Text>
                    </View>
                </View>
                <Text className="font-bold">Request Information</Text>
                <View className="flex flex-row justify-between bg-gray-200 p-3 rounded-2xl">
                    <Text className="text-gray-800 font-medium">Request ID</Text>
                    <Text className="font-normal">{resource._id}</Text>
                </View>
                <View className="flex flex-row justify-between bg-gray-200 p-3 rounded-2xl">
                    <Text className="text-gray-800 font-medium">Date Submitted</Text>
                    <Text className="font-normal">{formattedDate}</Text>
                </View>
                <View className="flex flex-row justify-between bg-gray-200 p-3 rounded-2xl">
                    <Text className="text-gray-800 font-medium">Location</Text>
                    <Text className="font-normal">{resource.resourceLocation}</Text>
                </View>
                <View className="flex flex-row justify-between bg-gray-200 p-3 rounded-2xl">
                    <Text className="text-gray-800 font-medium">Availability</Text>
                    <Text className="font-normal">{resource.resourceTiming}</Text>
                </View>
                <View className="flex flex-row justify-between bg-gray-200 p-3 rounded-2xl">
                    <Text className="text-gray-800 font-medium">Requested By</Text>
                    <TouchableOpacity onPress={() => { navigation.navigate('UserInfo', { id: username._id }) }}>
                        <Text className="font-normal text-blue-500">@{username.firstName + username.lastName}</Text>
                    </TouchableOpacity>

                </View>
                <Text className="font-semibold text-lg">Details</Text>
                <Text className="text-gray-600 text-lg bg-gray-200 p-2 rounded-2xl">{resource.resourceDescription}</Text>

                <View className="bg-blue-200 border-blue-400 border p-4 rounded-xl gap-3">
                    <View className="flex flex-row items-center gap-2">
                        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=ekQbwYDb6WQb&format=png&color=000000' }} className="w-6 h-6" />
                        <Text className="text-blue-600 font-bold text-lg">Contact Information</Text>
                    </View>
                    <View className="flex flex-row justify-between gap-2 bg-gray-200 p-3 rounded-xl">
                        <Text className="text-gray-700 font-bold text-md">Phone Number</Text>
                        <Text className="text-md font-bold">{resource.resourceContactNumber}</Text>
                    </View>
                    <View className="flex justify-between flex-row">
                        <View className="bg-green-600 p-3 px-5 rounded-2xl flex flex-row gap-2">
                            <Image source={{ uri: 'https://img.icons8.com/?size=100&id=ekQbwYDb6WQb&format=png&color=000000' }} className="w-6 h-6" />
                            <TouchableOpacity >
                                <Text className="text-white font-bold">Call Now</Text>
                            </TouchableOpacity>
                        </View>
                        <View className=" p-3 px-5 rounded-2xl flex flex-row gap-2">
                            <Image source={{ uri: 'https://img.icons8.com/?size=100&id=pY0SuitdJfO7&format=png&color=000000' }} className="w-6 h-6" />
                            <TouchableOpacity >
                                <Text className="text-white font-bold">Message</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View className="flex gap-4 ">
                    <TextInput onChangeText={(text) => setComment(text)} mode="flat" underlineColor="transparent" className="rounded-2xl " placeholder="Add a comment..."></TextInput>
                    <TouchableOpacity onPress={() => addComment()} className="bg-blue-600 p-3 rounded-xl flex flex-row justify-center">
                        <Text className="text-white font-medium ">Add Comment</Text>
                    </TouchableOpacity>
                </View>
                <View className="">
                    <Text className="text-xl font-bold pb-4">All Comments</Text>

                    <View className="border border-gray-400 mb-4 mt-4" />

                    <View className="flex px-4 backdrop-blur-2xl shadow-xl rounded-xl border flex-col gap-4 pb-4">
                        <Text className="py-4">
                            {fetchedComment.length} {fetchedComment.length <= 1 ? 'Comment' : 'Comments'}
                        </Text>

                        {fetchedComment.map((obj, index) => {
                            const user = userInfo[obj.userId];
                            console.log(user)

                            const postedAgo = obj.createdAt ? timeAgo(obj.createdAt) : 'just now';

                            return (
                                <View
                                    key={index}
                                    className="border backdrop-blur-xl shadow-sm p-3 rounded-xl hover:-translate-y-2 transition flex flex-col gap-2 mb-4"
                                >
                                    <View className="flex flex-row gap-4 items-center">
                                        <Image style={{ height: 40, width: 40 }} source={{ uri: `${user?.profilePic || 'Loading...'}` }} className="rounded-full border" />
                                        <View>
                                            <Text className="font-bold text-md">{user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}</Text>
                                            <Text className="text-blue-400">{obj.commentDescription}</Text>
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-gray-700">{postedAgo}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

            </View>
        </ScrollView>
    )
}
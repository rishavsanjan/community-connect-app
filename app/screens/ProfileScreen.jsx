import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView, Pressable } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Platform } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileNotLogged from './ProfileNotLogged'


export default function ProfileScreen({ navigation }) {

    const [profile, setProfile] = useState(null);
    const [editProfile, setEditProfile] = useState(false);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [title, setTitle] = useState('');
    const [alert, setAlert] = useState(false);
    const [editProfilePic, setEditProfilePic] = useState(false);
    const [editBackImg, setEditBackImg] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');

    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
    const fetchProfile = async () => {
        let token;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('token');
        } else {
            token = await AsyncStorage.getItem('token');
        }

        if (token === null) {
            return (
                <ProfileNotLogged navigation={navigation} />

            )
        }

        const response = await fetch(`${baseURL}/profile`, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        setProfile(data);
        setTitle(data.role);
        setDescription(data.description);

    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (profile === null) {
        return (

            <ProfileNotLogged navigation={navigation} />

        )
    }

    async function handleLogOut() {
        if (Platform.OS === 'web') {
            localStorage.removeItem("token")
        } else {
            await AsyncStorage.removeItem('token');
        }
    }



    async function handleSaveChanges() {

        let token;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('token');
        } else {
            token = await AsyncStorage.getItem('token');
        }
        console.log('token is ' + token);

        const formData = new FormData();
        formData.append("role", title);
        formData.append("description", description);

        const response = await fetch(`${baseURL}/editprofile`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })

        const json = await response.json();

        setEditProfile(false);
        await fetchProfile();
    }


    return (
        <ScrollView>
            <View className='relative'>
                <Image style={{ height: 175, width: '100%' }} source={{ uri: `${profile.backPic}` }} />
                <Image className='rounded-full border-4 border-white' style={{
                    top: 120, right: 35, width: 130, height: 130, zIndex: 1, position: 'absolute'
                }} source={{ uri: `${profile.profilePic}` }} />
            </View>
            <View className='p-6 flex gap-4'>
                <View className='flex flex-col'>
                    <Text className='text-2xl font-semibold'>{profile.firstName + ' ' + profile.lastName}</Text>
                    <View className='flex flex-row items-center gap-2'>
                        <Image style={{ height: 17, width: 17 }} source={{ uri: 'https://img.icons8.com/?size=100&id=wbEeSzVbPC5N&format=png&color=000000' }} />
                        <Text className='font-medium text-md text-gray-500'>{profile.role}</Text>
                    </View>
                </View>
                <View className='flex flex-row justify-between gap-4'>
                    <Pressable style={{ borderColor: 'blue' }} className='flex flex-row items-center gap-8 bg-blue-200 rounded-xl p-5 border'>
                        <View>
                            <Text className='text-blue-800 text-3xl font-semibold'>{[profile.resourcesRequested.length + profile.resourceAvailable.length]}</Text>
                            <Text className='text-blue-500 font-semibold'>Resources</Text>
                        </View>
                        <View className='bg-blue-300 p-3 rounded-xl'>
                            <Image style={{ height: 25, width: 25 }} source={{ uri: 'https://img.icons8.com/?size=100&id=wbEeSzVbPC5N&format=png&color=000000' }} />
                        </View>
                    </Pressable>
                    <Pressable style={{ borderColor: 'purple' }} className='flex flex-row items-center gap-8 bg-purple-200 rounded-xl p-5 border'>
                        <View>
                            <Text className='text-purple-800 text-3xl font-semibold'>{profile.connections.length}</Text>
                            <Text className='text-purple-500 font-semibold'>Connections</Text>
                        </View>
                        <View className='bg-purple-300 p-3 rounded-xl'>
                            <Image style={{ height: 25, width: 25 }} source={{ uri: 'https://img.icons8.com/?size=100&id=K7ebDTcbruY8&format=png&color=000000' }} />
                        </View>
                    </Pressable>
                </View>
                <View className='p-5 bg-white rounded-xl gap-4'>
                    <View className='flex flex-row justify-between'>
                        <Text className='font-bold text-xl text-black'>About</Text>
                        <TouchableOpacity onPress={() => setEditProfile(prev => !prev)}>
                            {editProfile || <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=0EhtnPiudpB7&format=png&color=000000' }} />}
                            {editProfile && <Text onPress={() => { handleSaveChanges() }}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                    <View style={{ borderLeftWidth: 5, borderColor: 'grey' }} className='p-4 bg-gray-200 rounded-xl'>
                        {editProfile || <Text className='italic'>{profile.description === 'null' ? 'No information added yet. Click edit to add your bio.' : `${profile.description}`}</Text>}
                        {editProfile && <TextInput onChangeText ={(text) => setDescription(text)} value={description}></TextInput>}
                    </View>
                </View>
                <View className='p-5 bg-white rounded-xl gap-4'>
                    <View className='flex flex-row justify-between'>
                        <Text className='font-bold text-xl text-black'>Contact Information</Text>
                        <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=0EhtnPiudpB7&format=png&color=000000' }} />
                    </View>
                    <View className='flex flex-row items-center bg-blue-200 rounded-xl p-3 px-8 justify-start gap-16'>
                        <View className='bg-blue-500 p-4 rounded-xl'>
                            <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=13754&format=png&color=000000' }} />
                        </View>
                        <View>
                            <Text className='text-blue-600 font-medium text-lg'>EMAIL</Text>
                            <Text className='font-semibold text-lg'>{profile.email}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row items-center bg-green-200 rounded-xl p-3 px-8 justify-start gap-16'>
                        <View className='bg-green-500 p-4 rounded-xl'>
                            <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=9659&format=png&color=FFFFFF' }} />
                        </View>
                        <View>
                            <Text className='text-green-600 font-medium text-lg'>PHONE</Text>
                            <Text className='font-semibold text-lg'>{profile.phoneNumber}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row items-center bg-purple-200 rounded-xl p-3 px-8 justify-start gap-16'>
                        <View className='bg-purple-500 p-4 rounded-xl'>
                            <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=85353&format=png&color=FFFFFF' }} />
                        </View>
                        <View>
                            <Text className='text-purple-600 font-medium text-lg'>Location</Text>
                            <Text className='font-semibold text-lg'>{profile.location}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>


    )
}
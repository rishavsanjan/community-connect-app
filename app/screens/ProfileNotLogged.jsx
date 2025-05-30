import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Platform } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ProfileNotLogged({ navigation }) {
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

    console.log(profile)

    return (
        <View style={{ backgroundColor: 'cyan', padding: 20 }} className='flex-1 justify-center'>
            <View className='flex gap-4 rounded-xl  p-8 bg-white ' style={{ borderWidth: 0 }}>
                <View className='flex gap-4 items-center'>
                    <Image source={{ uri: 'https://img.icons8.com/?size=100&id=2zQuuMM0XuM9&format=png&color=000000' }} style={{ width: 100, height: 100 }} />
                    <Text className='font-bold text-3xl'>Welcome!</Text>
                    <Text style={{ textAlign: 'center' }} className='text-gray-500 '>Connect with your community and discover local resources</Text>
                </View>
                <View style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }} className='p-8 border rounded-2xl'>
                    <Text style={{ color: '#9A598A', textAlign: 'center' }}>You need to login to access Community Connect</Text>
                </View>
                <View className='flex gap-4'>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} className='rounded-md p-4 items-center' style={{ backgroundColor: '#06B6D4' }}>
                        <Text className=' text-white font-bold'>
                            Log In
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')} className='rounded-md p-4 items-center border' style={{ backgroundColor: 'white', borderColor: '#06B6D4' }}>
                        <Text style={{ color: '#06B6D4' }} className=' font-bold '>
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ textAlign: 'center' }} className='text-gray-500'>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
            </View>

        </View>

    )
}
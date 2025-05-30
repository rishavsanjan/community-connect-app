import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView } from 'react-native';
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
        console.log('token is ' + token)
        if (token === null) { 
            return (
                <ProfileNotLogged navigation={navigation} />

            )
        }

        const response = await fetch(`${baseURL}/profile `, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        console.log(data)
        setProfile(data);
        setTitle(data.role);
        setDescription(data.description);

    };

    useEffect(() => {
        fetchProfile();
    }, []);

    console.log(profile)
    if ( profile === null) {
        console.log('uello')
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



    return (
        <View>
            <Text>Logged</Text>
            <TouchableOpacity onPress={() => handleLogOut()}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>

    )
}
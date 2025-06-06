import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView, Pressable } from 'react-native';
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



import Toast from 'react-native-toast-message';



export default function ProfileScreen({ navigation }) {

    const [profile, setProfile] = useState(null);
    const [editProfile, setEditProfile] = useState(false);
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [title, setTitle] = useState('');
    const [alert, setAlert] = useState(false);
    const [editProfilePic, setEditProfilePic] = useState(false);
    const [editBackImg, setEditBackImg] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [backImageUri, setBackImageUri] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [city, setCity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(null);





    const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';




    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync(location.coords);
            console.log(address)
            if (address.length > 0) {
                setCity(address[0].city);
            }
        })();
    }, []);

    const fetchProfile = async () => {
        let token;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('token');
        } else {
            token = await AsyncStorage.getItem('token');
        }

        if (token === null) {
            setIsAuthenticated(false);
            return;
        }

        const response = await fetch(`${baseURL}/profile`, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            setIsAuthenticated(false);
            return;
        }

        const data = await response.json();
        setProfile(data);
        setTitle(data.role);
        setDescription(data.description);

    };

    useEffect(() => {
        fetchProfile();
    }, []);



    async function handleLogOut() {
        if (Platform.OS === 'web') {
            localStorage.removeItem("token")
        } else {
            await AsyncStorage.removeItem('token');
        }
        await fetchProfile();
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
        const imageUrl = await uploadToCloudinary(imageUri);
        const backImageUrl = await uploadToCloudinary(backImageUri);
        imageUrl !== undefined && formData.append("imageUri", imageUrl);
        backImageUrl !== undefined && formData.append("backImageUri", backImageUrl);
        
        const response = await fetch(`${baseURL}/editprofile`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        })

        const json = await response.json();

        setEditProfile(false);
        Toast.show({
            type: 'success',
            text1: 'Profile Updated Successfully!',
            position: 'top'
        });
        await fetchProfile();
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [])

    if (loading && Platform.OS !== 'web') {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <LottieView
                    source={require('../assets/Spinner@1x-1.0s-198px-198px.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                />
                <Text className="mt-4 text-lg">Loading...</Text>
            </View>
        );
    }

    if (isAuthenticated === false) {
        return (
            <ProfileNotLogged navigation={navigation} />

        )
    }

    const openCamera = () => {
        launchCamera(
            {
                mediaType: 'photo',
                cameraType: 'front',
                saveToPhotos: true,
            },
            (response) => {
                if (!response.didCancel && !response.errorCode) {
                    setImageUrl(response.assets[0].uri);
                }
            }
        )
    };

    const pickImage = async (isBackground = false) => {
        launchImageLibrary(
            { mediaType: 'photo' },
            (response) => {
                if (!response.didCancel && !response.errorCode) {
                    if (isBackground) {
                        setBackImageUri(response.assets[0].uri);
                    } else {
                        setImageUri(response.assets[0].uri);
                    }
                }
            }
        );
    };



    if (!profile) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <LottieView
                    source={require('../assets/Spinner@1x-1.0s-198px-198px.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                />
                <Text className="mt-4 text-lg">Loading...</Text>
            </View>
        );
    }

    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'profilePics');
        data.append('cloud_name', 'diwmvqto3');

        const response = await fetch('https://api.cloudinary.com/v1_1/diwmvqto3/image/upload', {
            method: 'POST',
            body: data,
        });
        const result = await response.json();
        console.log(result.secure_url)
        return result.secure_url;

    }

    const uploadToCloudinaryBack = async (file) => {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'backImg');
        data.append('cloud_name', 'diwmvqto3');

        const response = await fetch('https://api.cloudinary.com/v1_1/diwmvqto3/image/upload', {
            method: 'POST',
            body: data,
        });
        const result = await response.json();
        return result.secure_url;
    }

    return (
        <ScrollView>
            <View className='relative flex  items-center'>
                {editProfile === false ? <Image style={{ height: 175, width: '100%' }} source={{ uri: `${profile?.backPic || 'Loading...'}` }} /> : <TouchableOpacity style={{ height: 175, width: 175 }} className='flex justify-start' onPress={() => { pickImage(true) }}>
                    <Image alt='Tap to change background image' style={{ height: 175, width: 175, paddingLeft: 100, paddingRight: 80 }} source={{ uri: 'https://img.icons8.com/?size=100&id=24717&format=png&color=000000' }} />
                    <Text>Tap to change your background image</Text>
                </TouchableOpacity>}

                {editProfile === false ? <Image className='rounded-full border-4 border-white' style={{
                    top: 120, right: 35, width: 130, height: 130, zIndex: 1, position: 'absolute'
                }} source={{ uri: `${profile?.profilePic || 'Loading...'}` }} /> :
                    <TouchableOpacity className='' onPress={() => { pickImage() }} style={{
                        top: 120, right: 35, width: 130, height: 130, zIndex: 1, position: 'absolute',
                    }}>
                        <Image className='rounded-full border-4 border-white' style={{
                            width: 130, height: 130, backgroundColor: 'grey'
                        }} source={{ uri: 'https://img.icons8.com/?size=100&id=24717&format=png&color=000000' }} />

                    </TouchableOpacity>
                }
            </View>
            <View className='p-6 flex gap-4'>
                <View className='flex flex-col'>
                    <Text className='text-2xl font-semibold'>{(profile?.firstName || 'Loading...') + ' ' + (profile?.lastName || 'Loading...')}</Text>
                    <View className='flex flex-row items-center gap-2'>
                        <Image style={{ height: 17, width: 17 }} source={{ uri: 'https://img.icons8.com/?size=100&id=wbEeSzVbPC5N&format=png&color=000000' }} />
                        {editProfile === false ? <Text className='font-medium text-md text-gray-500'>{profile?.role || 'Loading...'}</Text> : <TextInput onChangeText={(text) => { setTitle(text) }} placeholder='Enter role' style={{ height: 10 }} className='w-44'></TextInput>}
                    </View>
                </View>
                <View>
                    {editProfile === false && <View style={{ width: 90 }} className='bg-blue-500 rounded-xl'><Text onPress={() => setEditProfile(true)} className='text-white p-2 font-medium text-center'>Edit Profile</Text></View>}
                    {editProfile === true &&
                        <View className='flex flex-row gap-4'>
                            <TouchableOpacity onPress={() => { setEditProfile(false); handleSaveChanges() }} style={{ padding: 8 }} className='bg-blue-500  rounded-xl'>
                                <Text className='text-white font-bold'>Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditProfile(false)} style={{ padding: 8 }} className='bg-gray-500  rounded-xl'>
                                <Text className='text-white font-bold'>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                <View className='flex flex-row justify-between gap-4'>
                    <Pressable style={{ borderColor: 'blue' }} className='flex flex-row items-center gap-8 bg-blue-200 rounded-xl p-5 border'>
                        <View>
                            <Text className='text-blue-800 text-3xl font-semibold'>{(profile?.resourcesRequested?.length || 0) + (profile?.resourceAvailable?.length || 0)}</Text>
                            <Text className='text-blue-500 font-semibold'>Resources</Text>
                        </View>
                        <View className='bg-blue-300 p-3 rounded-xl'>
                            <Image style={{ height: 25, width: 25 }} source={{ uri: 'https://img.icons8.com/?size=100&id=wbEeSzVbPC5N&format=png&color=000000' }} />
                        </View>
                    </Pressable>
                    <Pressable style={{ borderColor: 'purple' }} className='flex flex-row items-center gap-8 bg-purple-200 rounded-xl p-5 border'>
                        <Pressable onPress={() => navigation.navigate('Connections')}>
                            <Text className='text-purple-800 text-3xl font-semibold'>{profile?.connections?.length || '0'}</Text>
                            <Text className='text-purple-500 font-semibold'>Connections</Text>
                        </Pressable>
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
                        {editProfile || <Text className='italic'>{!profile.description || profile.description === 'null' ? 'No information added yet. Click edit to add your bio.' : `${profile.description}`}</Text>}
                        {editProfile && <TextInput onChangeText={(text) => setDescription(text)} value={description}></TextInput>}
                    </View>
                </View>
                <View className='p-5 bg-white rounded-xl gap-4'>
                    <View className='flex flex-row justify-between'>
                        <Text className='font-bold text-xl text-black'>Contact Information</Text>
                        <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=0EhtnPiudpB7&format=png&color=000000' }} />
                    </View>
                    <View className='flex flex-row items-center bg-blue-200 rounded-xl p-3 px-8 justify-normal gap-6 '>
                        <View className='bg-blue-500 p-4 rounded-xl'>
                            <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=13754&format=png&color=000000' }} />
                        </View>
                        <View>
                            <Text className='text-blue-600 font-medium text-lg'>EMAIL</Text>
                            <Text className='font-semibold text-lg'>{profile.email}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row items-center bg-green-200 rounded-xl p-3 px-8 justify-normal gap-6'>
                        <View className='bg-green-500 p-4 rounded-xl'>
                            <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=9659&format=png&color=FFFFFF' }} />
                        </View>
                        <View>
                            <Text className='text-green-600 font-medium text-lg'>PHONE</Text>
                            <Text className='font-semibold text-lg'>{profile.phoneNumber}</Text>
                        </View>
                    </View>
                    <View className='flex flex-row items-center bg-purple-200 rounded-xl p-3 px-8 justify-normal gap-6'>
                        <View className='bg-purple-500 p-4 rounded-xl'>
                            <Image style={{ height: 20, width: 20 }} source={{ uri: 'https://img.icons8.com/?size=100&id=85353&format=png&color=FFFFFF' }} />
                        </View>
                        <View>
                            <Text className='text-purple-600 font-medium text-lg'>Location</Text>
                            <Text className='font-semibold text-lg'>{city}</Text>
                        </View>
                    </View>
                </View>
                <View>
                    <TouchableOpacity onPress={() => { handleLogOut(); navigation.navigate('Profile') }} className='bg-red-500 p-3 rounded-xl'>
                        <Text className='text-white text-center font-semibold text-xl'>LogOut</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>


    )
}
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View, ScrollView, Pressable, Button, TouchableHighlight } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SelectList } from 'react-native-dropdown-select-list';
import { Checkbox } from 'react-native-paper';



export default function RequestScreen() {

    const [resourceType, setResourceType] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceDescription, setResourceDescription] = useState('');
    const [resourceLocation, setResourceLocation] = useState('');
    const [resourceContactNumber, setResourceContactNumber] = useState('');
    const [resourceTiming, setResourceTiming] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [postType, setPostType] = useState('request');
    const [msg, setMsg] = useState('');
    const [resourcePriority, setResourcePriority] = useState('');
    const [selected, setSelected] = useState("");
    const [checked, setChecked] = useState(false);





    const resourceTypes = [
        { id: "medical", label: "Medical Supplies", icon: "🏥" },
        { id: "food", label: "Food Assistance", icon: "🍲" },
        { id: "housing", label: "Housing Support", icon: "🏠" },
        { id: "education", label: "Educational Resources", icon: "📚" },
        { id: "financial", label: "Financial Aid", icon: "💰" },
        { id: "clothing", label: "Clothing", icon: "👕" },
        { id: "transportation", label: "Transportation", icon: "🚌" },
        { id: "childcare", label: "Childcare", icon: "👶" },
        { id: "other", label: "Other", icon: "➕" }
    ];

    const priority = [
        { value: 'Low Priority' },
        { value: 'Medium Priority' },
        { value: 'High Priority' }
    ]

    return (
        <ScrollView>
            <View className='p-4 flex items-center gap-4'>
                <View>
                    <Text className='font-bold text-2xl'>{postType === 'request' ? 'Request' : 'Provide'} Resource</Text>
                </View>
                <View className=''>
                    <Text className='text-gray-500 text-sm '>{postType === 'request' ? ' Specify what resources you need from our community' :
                        'Specify what resources you will provide to the community'
                    }</Text>

                </View>
                <View className='flex flex-row gap-5 justify-between'>
                    <TouchableHighlight >
                        <Text onPress={() => { setPostType('request') }} className={` p-2 rounded-xl ${postType === 'request' ? 'bg-blue-500 text-white' : 'bg-white text-black border-black border'}`}>
                            I need resources
                        </Text>
                    </TouchableHighlight>

                    <TouchableOpacity >
                        <Text onPress={() => { setPostType('upload') }} className={` p-2 rounded-xl ${postType === 'upload' ? 'bg-blue-500 text-white' : 'bg-white text-black border-black border'}`}>
                            I provide resources
                        </Text>
                    </TouchableOpacity>
                </View>
                <View className='flex gap-2'>
                    <Text className='font-bold text-lg'>Resource Type</Text>
                    <Text className=' text-sm text-gray-500'>Select the type of resource that you need</Text>
                    <View className='flex flex-row flex-wrap justify-between gap-4 '>
                        {resourceTypes.map((obj, index) => {
                            return (
                                <Pressable key={index} className={`items-center bg-white border border-black p-2 rounded-xl w-52 py-4 flex gap-2`}>
                                    <Text>{obj.icon}</Text>
                                    <Text>{obj.label}</Text>
                                </Pressable >
                            )
                        })}
                    </View>
                </View>
                <View className='w-full flex gap-4'>
                    <View className='gap-2'>
                        <Text className='font-semibold'>Title</Text>
                        <TextInput className='bg-white text-gray-500 p-2' placeholder='Enter Title'></TextInput>
                    </View>
                    <View className='gap-2'>
                        <Text className='font-semibold'>Description</Text>
                        <TextInput className='bg-white text-gray-500 border border-white' placeholder='Please provide the detail about the resources...'></TextInput>
                    </View>
                    <View className='gap-2'>
                        <Text className='font-semibold'>Location</Text>
                        <TextInput className='bg-white text-gray-500 border border-white' placeholder='Enter Location'></TextInput>
                    </View>
                    <View className='gap-2'>
                        <Text className='font-semibold'>Contact Number</Text>
                        <TextInput className='bg-white text-gray-500 border border-white' placeholder='Enter Contact Number'></TextInput>
                    </View>
                    <View className='gap-2'>
                        <Text className='font-semibold'>Timing</Text>
                        <TextInput className='bg-white text-gray-500 border border-white' placeholder='Enter Timing'></TextInput>
                    </View>

                    <View className='gap-2'>
                        <Text className='font-semibold'>Select Priority</Text>

                        <SelectList setSelected={(val) => setSelected(val)}
                            data={priority}
                            save='value'
                        />
                    </View>
                    <View className="flex flex-row items-center -mx-2">
                        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} />
                        <Text className="font-semibold">I agree to the terms and conditions</Text>
                    </View>
                    <TouchableOpacity className='bg-blue-500 items-center rounded-xl'>
                        <Text className='text-white p-2 font-semibold'>
                            Request
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>

    )
}
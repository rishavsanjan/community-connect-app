import { useState } from "react";
import { Text, TextInput, TextInputComponent, Switch, TouchableOpacity, View, ScrollView } from "react-native";
import { Checkbox } from 'react-native-paper';

export default function SignUpScreen({ navigation }) {
    const [checked, setChecked] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState('');
    const [login, setLogin] = useState();
    const [conditions, setConditions] = useState(false);


    return (
        <ScrollView>
            <View className="flex flex-col gap-4 m-4 p-8 border shadow-xl backdrop-blur-md items-center justify-center bg-white">
                <Text className="text-3xl font-bold mt-4"> Create An Account</Text>
                <Text className="text-gray-500">Join our community to access resources</Text>
                <View className="flex gap-5 justify-start w-full">
                    <View className="flex gap-2">
                        <Text className="font-bold text-lg">First Name</Text>
                        <TextInput onChangeText={(text) => setFirstName(text)} placeholder="Enter your first name" className="pl-4 border rounded-md border-gray-400"></TextInput>
                    </View>
                    <View className="flex gap-2">
                        <Text className="font-bold text-lg">Last Name</Text>
                        <TextInput onChangeText={(text) => setLastName(text)} placeholder="Enter your last name" className="pl-4 border rounded-md border-gray-400"></TextInput>
                    </View>
                    <View className="flex gap-2">
                        <Text className="font-bold text-lg">Email Address</Text>
                        <TextInput onChangeText={(text) => setEmail(text)} placeholder="Enter your email" className="pl-4 border rounded-md border-gray-400"></TextInput>
                    </View>
                    <View className="flex gap-2">
                        <Text className="font-bold text-lg">Phone Number</Text>
                        <TextInput onChangeText={(text) => setPhoneNumber(text)} placeholder="Enter your phone number" className="pl-4 border rounded-md border-gray-400"></TextInput>
                    </View>
                    <View className="flex gap-2">
                        <Text className="font-bold text-lg">Zip Code</Text>
                        <TextInput onChangeText={(text) => setZipCode(text)} placeholder="Enter your zip code" className="pl-4 border rounded-md border-gray-400"></TextInput>
                    </View>
                    <View className="flex gap-2">
                        <Text className="font-bold text-lg">Password</Text>
                        <TextInput onChangeText={(text) => setPassword(text)} placeholder="Enter your password" className="pl-4 border rounded-md border-gray-400"></TextInput>
                    </View>
                    <View className="flex gap-2">
                        <Text className="font-bold text-lg">Confirm Password</Text>
                        <TextInput onChangeText={(text) => setConfirmPassword(text)} placeholder="Enter your password again" className="pl-4 border rounded-md border-gray-400"></TextInput>
                    </View>

                    <View className="flex gap-2">
                        <View className="flex flex-row items-center -mx-2">
                            <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked(!checked)} />
                            <Text className="font-semibold">I agree to all the terms and comditions</Text>
                        </View>
                        <View className="">
                            <TouchableOpacity className="bg-blue-500 rounded-lg w-full flex flex-row justify-center">
                                <Text className="text-white p-2 font-semibold">SignUp</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Text>Already have a account ?<Text onPress={() => navigation.navigate("Login")} className="text-blue-500"> Login</Text> </Text>


            </View>
        </ScrollView>

    );
}

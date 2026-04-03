import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DoctorRegisterScreen from '../screens/DoctorRegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AppointmentEntryScreen from '../screens/AppointmentEntryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const CalendarStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const DashboardStack = createNativeStackNavigator();

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} />
      <DashboardStack.Screen
        name="AppointmentEntry"
        component={AppointmentEntryScreen}
        options={{ presentation: 'modal' }}
      />
    </DashboardStack.Navigator>
  );
}

function CalendarStackScreen() {
  return (
    <CalendarStack.Navigator screenOptions={{ headerShown: false }}>
      <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} />
      <CalendarStack.Screen
        name="AppointmentEntry"
        component={AppointmentEntryScreen}
        options={{ presentation: 'modal' }}
      />
    </CalendarStack.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const icons = {
          Dashboard: isFocused ? 'home' : 'home-outline',
          Calendar: isFocused ? 'calendar' : 'calendar-outline',
          Profile: isFocused ? 'person' : 'person-outline',
        };
        const labels = {
          Dashboard: 'ANA SAYFA',
          Calendar: 'TAKVİM',
          Profile: 'PROFİL',
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={[tabStyles.tab, isFocused && tabStyles.tabActive]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={icons[route.name]}
              size={22}
              color={isFocused ? Colors.blue700 : Colors.slate400}
            />
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
              {labels[route.name]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabScreen() {
  return (
    <MainTab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <MainTab.Screen name="Dashboard" component={DashboardStackScreen} />
      <MainTab.Screen name="Calendar" component={CalendarStackScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="DoctorRegister" component={DoctorRegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabScreen} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: Colors.blue50,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.slate400,
    letterSpacing: 1,
    marginTop: 4,
  },
  labelActive: {
    color: Colors.blue700,
    fontWeight: '600',
  },
});

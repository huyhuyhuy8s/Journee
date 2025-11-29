// app/login.tsx
import React, { useEffect, useState } from "react";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import { Button, Form, Input, Text, useTheme, XStack, YStack } from "tamagui";
import { Home, MapPinned } from "@tamagui/lucide-icons";
import { useAuth } from "@/utils/auth";
import { useIsAuthenticated, useIsLoading } from "@/contexts/UserContext";
import { Link, router } from "expo-router";
import { BackendApiServices } from "@/services/backendApiServices"; // 🆕 Fixed name

const Login = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(""); // Local error for form validation

  const { login } = useAuth();
  const isLoading = useIsLoading(); // Global loading state
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/map");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      setLocalError("");

      if (!email || !password) {
        setLocalError("Please fill in all fields");
        return;
      }

      if (!email.includes("@")) {
        setLocalError("Please enter a valid email");
        return;
      }

      const result = await login(email, password);

      if (!result.success) {
        setLocalError(result.error || "Login failed");
      } else {
        console.log("Login successful");

        // Store user information and token for backend API requests
        if (result.user && result.token) {
          try {
            // Store authentication token for backend API calls
            await BackendApiServices.setAuthToken(result.token);

            // Store user ID for backend requests
            await BackendApiServices.setUserId(
              result.user.uid || result.user.id
            );

            console.log("✅ User credentials stored for backend API");

            // Test backend connection with new credentials
            const isBackendConnected =
              await BackendApiServices.testConnection();
            if (isBackendConnected) {
              console.log("✅ Backend connection verified");
            } else {
              console.warn("⚠️ Backend connection failed - will retry later");
            }

            // Navigate to tabs
            router.replace("/(tabs)/Map");
          } catch (backendError) {
            console.error(
              "❌ Error storing backend credentials:",
              backendError
            );
            router.replace("/(tabs)/Map");
          }
        }
      }
    } catch (err: any) {
      setLocalError("An unexpected error occurred. Please try again.");
      console.error("Login", err?.message);
    }
  };

  return (
    <SafeAreaVieww>
      <YStack
        height="100%"
        bg={theme.background}
        justify="center"
        items="center"
        paddingInline="$4"
      >
        <MapPinned
          position="absolute"
          t="$10"
          size="$10"
          color={theme.accent1}
        />
        <Home
          position="absolute"
          l="$5"
          t="$5"
          color={theme.color1}
          onPress={() => {
            router.push("/(tabs)/Map");
          }}
        />
        <YStack width="90%" gap="$4">
          <Text
            fontSize="$5"
            fontWeight="bold"
            text="center"
            color={theme.color1}
            marginEnd={20}
          >
            Welcome Back
          </Text>
          {localError && (
            <Text color={theme.red10} text="center" fontSize="$5">
              {localError}
            </Text>
          )}
          <Form gap="$3" onSubmit={handleLogin}>
            <Input
              size="$4"
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              bg={theme.color3}
              color={theme.color11}
              borderColor={localError ? theme.red8 : theme.borderColor}
              disabled={isLoading}
            />
            <Input
              size="$4"
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              passwordRules="required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;"
              secureTextEntry
              autoCapitalize="none"
              bg={theme.color3}
              color={theme.color11}
              borderColor={localError ? theme.red8 : theme.borderColor}
              disabled={isLoading}
            />
            <Form.Trigger asChild>
              <Button
                br={50}
                color={theme.color1}
                fontSize="$5"
                fontWeight="bold"
                bg={theme.accent1}
                disabled={isLoading}
                opacity={isLoading ? 0.7 : 1}
              >
                {isLoading ? "Signing In..." : "Login"}
              </Button>
            </Form.Trigger>
          </Form>
          <Link href={"/register"}>
            <Text color={theme.color1} text="center">
              Don't have an account? Sign Up
            </Text>
          </Link>
        </YStack>
      </YStack>
    </SafeAreaVieww>
  );
};

export default Login;

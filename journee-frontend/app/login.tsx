// app/login.tsx
import React, { useEffect, useState } from "react";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import { Button, Form, Input, Text, useTheme, XStack, YStack } from "tamagui";
import { Home, MapPinned } from "@tamagui/lucide-icons";
import { useAuth } from "@/utils/auth"; // 🆕 Use main auth directly
import { Link, router } from "expo-router";
import { BackendApiServices } from "@/services/backendApiServices";

const Login = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  // 🆕 Use main auth system directly
  const { login, isAuthenticated, isLoading } = useAuth();

  console.log("🔐 Login component - isAuthenticated:", isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Already authenticated, redirecting to tabs");
      router.replace("/(tabs)");
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

      console.log("🔐 Attempting login...");
      const result = await login(email, password);

      if (!result.success) {
        setLocalError(result.error || "Login failed");
      } else {
        console.log("✅ Login successful, user data:", result.user);

        // Store backend credentials
        if (result.user && result.token) {
          try {
            await BackendApiServices.setAuthToken(result.token);
            await BackendApiServices.setUserId(
              result.user.id || result.user.uid
            );
            console.log("✅ Backend credentials stored");
          } catch (backendError) {
            console.error(
              "❌ Error storing backend credentials:",
              backendError
            );
          }
        }

        // 🆕 Navigation will happen automatically via useEffect when isAuthenticated becomes true
        console.log("🚀 Login complete - waiting for auth state update");
      }
    } catch (err: any) {
      setLocalError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err?.message);
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
          color={theme.color2}
        />
        <Home
          position="absolute"
          l="$5"
          t="$5"
          color={theme.color1}
          onPress={() => {
            router.push("/(tabs)");
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
              bg={theme.color1}
              color={theme.color8}
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
              bg={theme.color1}
              color={theme.color8}
              borderColor={localError ? theme.red8 : theme.borderColor}
              disabled={isLoading}
            />
            <Form.Trigger asChild>
              <Button
                br={50}
                color={theme.color1}
                fontSize="$5"
                fontWeight="bold"
                bg={theme.color8}
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

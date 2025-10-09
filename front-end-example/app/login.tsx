import React, { useEffect, useState } from "react";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import {
  Button,
  Form,
  Input,
  Spinner,
  Text,
  useTheme,
  XStack,
  YStack,
} from "tamagui";
import { Home, MapPinned } from "@tamagui/lucide-icons";
import { useAuth } from "@/utils/auth";
import { useIsAuthenticated, useIsLoading } from "@/contexts/UserContext";
import { Link, router } from "expo-router";

// Sample accounts
// john@example.com
// password

const Login = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const isLoading = useIsLoading();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error || "Login failed");
    } else {
      console.log("Login successful");
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
          {error && (
            <Text color={theme.red10} text="center" fontSize="$5">
              {error}
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
              color={theme.color10}
              borderColor={error ? theme.red8 : theme.borderColor}
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
              color={theme.color10}
              borderColor={error ? theme.red8 : theme.borderColor}
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
                {isLoading ? (
                  <XStack gap="$2" items="center">
                    <Spinner size="small" color={theme.color1.val} />
                    <Text color={theme.color1}>Signing In...</Text>
                  </XStack>
                ) : (
                  "Login"
                )}
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

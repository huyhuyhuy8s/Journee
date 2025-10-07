import React from "react";
import {
  Button,
  H5,
  Separator,
  SizableText,
  Tabs,
  TabsContentProps,
  useTheme,
  View,
  YStack,
} from "tamagui";
import {
  Contact,
  Map,
  MessageSquare,
  Newspaper,
  User,
} from "@tamagui/lucide-icons";

import { Tabs as ExpoTabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const TamaguiTabs = () => {
  const TabsContent = (props: TabsContentProps) => {
    return (
      <Tabs.Content bg="$background" key="tab3" flex={1} {...props}>
        {props.children}
      </Tabs.Content>
    );
  };

  return (
    <SafeAreaView>
      <View height="100%" width="100%" justify="center" items="center">
        <Tabs
          defaultValue="tab1"
          orientation="horizontal"
          flexDirection="column"
          $maxMd={{ width: "100%" }}
          height="100%"
          borderStartEndRadius="$4"
          borderWidth="$0.25"
          overflow="hidden"
          borderColor="$borderColor"
        >
          <Tabs.List
            disablePassBorderRadius="bottom"
            aria-label="Manage your account"
            bottom={1}
          >
            <Tabs.Tab
              focusStyle={{
                backgroundColor: "$color3",
              }}
              flex={1}
              value="tab1"
            >
              <SizableText fontFamily="$body" text="center">
                Profile
              </SizableText>
            </Tabs.Tab>
            <Tabs.Tab
              focusStyle={{
                backgroundColor: "$color3",
              }}
              flex={1}
              value="tab2"
            >
              <SizableText fontFamily="$body" text="center">
                Connections
              </SizableText>
            </Tabs.Tab>
            <Tabs.Tab
              focusStyle={{
                backgroundColor: "$color3",
              }}
              flex={1}
              value="tab3"
            >
              <SizableText fontFamily="$body" text="center">
                Notification
              </SizableText>
            </Tabs.Tab>
          </Tabs.List>
          <Separator />
          <TabsContent value="tab1">
            <H5>Profile</H5>
          </TabsContent>
          <TabsContent value="tab2">
            <H5>Connections</H5>
          </TabsContent>
          <TabsContent value="tab3">
            <H5>Notifications</H5>
          </TabsContent>
        </Tabs>
      </View>
    </SafeAreaView>
  );
};

const _Layout = () => {
  const theme = useTheme();

  return (
    <ExpoTabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        },
        tabBarStyle: {
          backgroundColor: theme.color1.val,
          paddingHorizontal: 30,
          paddingBlockStart: 100,
          height: 70,
          position: "absolute",
          overflow: "hidden",
          borderTopWidth: 1,
          borderColor: theme.color12.val,
        },
      }}
    >
      <ExpoTabs.Screen
        name="index"
        options={{
          title: "Maps",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Map size="$1.5" color={focused ? theme.accent1 : theme.color12} />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="newsfeed"
        options={{
          title: "Newsfeed",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Newspaper
              size="$1.5"
              color={focused ? theme.accent1 : theme.color12}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <MessageSquare
              size="$1.5"
              color={focused ? theme.accent1 : theme.color12}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Contact
              size="$1.5"
              color={focused ? theme.accent1 : theme.color12}
            />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <User size="$1.5" color={focused ? theme.accent1 : theme.color12} />
          ),
        }}
      />
    </ExpoTabs>
  );
};

export default _Layout;

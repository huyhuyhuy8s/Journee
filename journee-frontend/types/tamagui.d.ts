import { TamaguiComponent } from "@tamagui/core";

declare module "@tamagui/core" {
  interface StackStyleBase {
    br?: number | string;
  }

  interface TextStyleBase {
    br?: number | string;
  }

  interface ButtonStyleBase {
    br?: number | string;
  }

  interface InputStyleBase {
    br?: number | string;
  }

  interface ViewStyleBase {
    br?: number | string;
  }
}

// Extend all common Tamagui component props
declare module "tamagui" {
  interface ButtonProps {
    br?: number | string;
  }

  interface InputProps {
    br?: number | string;
  }

  interface TextProps {
    br?: number | string;
  }

  interface YStackProps {
    br?: number | string;
  }

  interface XStackProps {
    br?: number | string;
  }

  interface ViewProps {
    br?: number | string;
  }
}

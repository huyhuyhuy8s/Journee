import * as Colors from "@tamagui/colors";
import { createThemes, defaultComponentThemes } from "@tamagui/theme-builder";

const darkPalette = [
  "hsla(0, 15%, 1%, 1)",
  "hsla(0, 15%, 6%, 1)",
  "hsla(0, 15%, 12%, 1)",
  "hsla(0, 15%, 17%, 1)",
  "hsla(0, 15%, 23%, 1)",
  "hsla(0, 15%, 28%, 1)",
  "hsla(0, 15%, 34%, 1)",
  "hsla(0, 15%, 39%, 1)",
  "hsla(0, 15%, 45%, 1)",
  "hsla(0, 15%, 50%, 1)",
  "hsla(0, 15%, 93%, 1)",
  "hsla(0, 15%, 99%, 1)",
];
const lightPalette = [
  "hsla(0, 15%, 99%, 1)",
  "hsla(0, 15%, 94%, 1)",
  "hsla(0, 15%, 88%, 1)",
  "hsla(0, 15%, 83%, 1)",
  "hsla(0, 15%, 77%, 1)",
  "hsla(0, 15%, 72%, 1)",
  "hsla(0, 15%, 66%, 1)",
  "hsla(0, 15%, 61%, 1)",
  "hsla(0, 15%, 55%, 1)",
  "hsla(0, 15%, 50%, 1)",
  "hsla(0, 15%, 15%, 1)",
  "hsla(0, 15%, 1%, 1)",
];

const lightShadows = {
  shadow1: "rgba(0,0,0,0.04)",
  shadow2: "rgba(0,0,0,0.08)",
  shadow3: "rgba(0,0,0,0.16)",
  shadow4: "rgba(0,0,0,0.24)",
  shadow5: "rgba(0,0,0,0.32)",
  shadow6: "rgba(0,0,0,0.4)",
};

const darkShadows = {
  shadow1: "rgba(0,0,0,0.2)",
  shadow2: "rgba(0,0,0,0.3)",
  shadow3: "rgba(0,0,0,0.4)",
  shadow4: "rgba(0,0,0,0.5)",
  shadow5: "rgba(0,0,0,0.6)",
  shadow6: "rgba(0,0,0,0.7)",
};

// we're adding some example sub-themes for you to show how they are done, "success" "warning", "error":

// custom color palette provided by the project owner. These are added as
// named tokens so you can reference them e.g. $text, $background, $primary
// etc. from components or via useTheme/useTokens.
const userPalette = {
  // Các màu đơn lẻ trong 'dark' và 'light' giờ đã được chuyển thành các thuộc tính riêng bên dưới,
  // chỉ giữ lại background và secondary vì chúng không cần 12 bước màu.
  dark: {
    background: "hsla(204, 35%, 6%, 1)",
    secondary: "hsla(229, 53%, 34%, 1)",
  },
  light: {
    background: "hsla(204, 67%, 98%, 1)",
    secondary: "hsla(197, 69%, 34%, 1)",
  },

  // 1. PRIMARY (Base: hsla(203, 64%, 74%, 1))
  // Dải màu xanh dương nhạt
  primary: {
    palette: {
      dark: [
        "hsla(203, 64%, 74%, 1)", // 0 - Giá trị gốc
        "hsla(203, 64%, 76%, 1)",
        "hsla(203, 64%, 78%, 1)",
        "hsla(203, 64%, 80%, 1)",
        "hsla(203, 64%, 83%, 1)",
        "hsla(203, 64%, 85%, 1)",
        "hsla(203, 64%, 87%, 1)",
        "hsla(203, 64%, 88%, 1)",
        "hsla(203, 64%, 90%, 1)",
        "hsla(203, 64%, 90%, 1)",
        "hsla(203, 50%, 90%, 1)", // 10
        "hsla(203, 50%, 95%, 1)", // 11
      ],
      light: [
        "hsla(203, 64%, 74%, 1)", // 0 - Giá trị gốc
        "hsla(203, 64%, 66%, 1)",
        "hsla(203, 64%, 58%, 1)",
        "hsla(203, 64%, 51%, 1)",
        "hsla(203, 64%, 43%, 1)",
        "hsla(203, 64%, 35%, 1)",
        "hsla(203, 64%, 28%, 1)",
        "hsla(203, 64%, 20%, 1)",
        "hsla(203, 64%, 12%, 1)",
        "hsla(203, 64%, 10%, 1)",
        "hsla(203, 50%, 5%, 1)",  // 10
        "hsla(203, 50%, 10%, 1)", // 11
      ],
    },
  },

  // 2. TEXT (Dark Base: hsla(204, 55%, 92%, 1) | Light Base: hsla(204, 38%, 5%, 1))
  // Dải màu cho văn bản, làm mờ từ màu gốc (Text-0 là màu chuẩn)
  text: {
    palette: {
      dark: [
        "hsla(204, 55%, 92%, 1)", // 0 - Màu văn bản chính
        "hsla(204, 55%, 83%, 1)",
        "hsla(204, 55%, 74%, 1)",
        "hsla(204, 55%, 65%, 1)",
        "hsla(204, 55%, 56%, 1)",
        "hsla(204, 55%, 47%, 1)",
        "hsla(204, 55%, 38%, 1)",
        "hsla(204, 55%, 29%, 1)",
        "hsla(204, 55%, 20%, 1)",
        "hsla(204, 55%, 10%, 1)",
        "hsla(204, 50%, 5%, 1)",  // 10
        "hsla(204, 50%, 10%, 1)", // 11
      ],
      light: [
        "hsla(204, 38%, 5%, 1)",  // 0 - Màu văn bản chính
        "hsla(204, 38%, 14%, 1)",
        "hsla(204, 38%, 23%, 1)",
        "hsla(204, 38%, 32%, 1)",
        "hsla(204, 38%, 41%, 1)",
        "hsla(204, 38%, 50%, 1)",
        "hsla(204, 38%, 59%, 1)",
        "hsla(204, 38%, 68%, 1)",
        "hsla(204, 38%, 77%, 1)",
        "hsla(204, 38%, 90%, 1)",
        "hsla(204, 50%, 90%, 1)", // 10
        "hsla(204, 50%, 95%, 1)", // 11
      ],
    },
  },

  // 3. ACCENT (Dark Base: hsla(246, 52%, 54%, 1) | Light Base: hsla(168, 88%, 43%, 1))
  // Dải màu tím (dark) và xanh ngọc (light)
  accent: {
    palette: {
      dark: [
        "hsla(246, 52%, 54%, 1)", // 0 - Giá trị gốc
        "hsla(246, 52%, 59%, 1)",
        "hsla(246, 52%, 64%, 1)",
        "hsla(246, 52%, 69%, 1)",
        "hsla(246, 52%, 74%, 1)",
        "hsla(246, 52%, 79%, 1)",
        "hsla(246, 52%, 83%, 1)",
        "hsla(246, 52%, 86%, 1)",
        "hsla(246, 52%, 90%, 1)",
        "hsla(246, 52%, 90%, 1)",
        "hsla(246, 50%, 90%, 1)", // 10
        "hsla(246, 50%, 95%, 1)", // 11
      ],
      light: [
        "hsla(168, 88%, 43%, 1)", // 0 - Giá trị gốc
        "hsla(168, 88%, 39%, 1)",
        "hsla(168, 88%, 34%, 1)",
        "hsla(168, 88%, 30%, 1)",
        "hsla(168, 88%, 25%, 1)",
        "hsla(168, 88%, 21%, 1)",
        "hsla(168, 88%, 16%, 1)",
        "hsla(168, 88%, 12%, 1)",
        "hsla(168, 88%, 10%, 1)",
        "hsla(168, 88%, 10%, 1)",
        "hsla(168, 50%, 5%, 1)",  // 10
        "hsla(168, 50%, 10%, 1)", // 11
      ],
    },
  },
};

const builtThemes = createThemes({
  componentThemes: defaultComponentThemes,

  base: {
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },

    extra: {
      light: {
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...lightShadows,
        shadowColor: lightShadows.shadow1,
      },
      dark: {
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...darkShadows,
        shadowColor: darkShadows.shadow1,
      },
    },
  },

  accent: {
    palette: {
      dark: [
        "hsla(160, 100%, 35%, 1)",
        "hsla(160, 100%, 38%, 1)",
        "hsla(160, 100%, 41%, 1)",
        "hsla(160, 100%, 43%, 1)",
        "hsla(160, 100%, 46%, 1)",
        "hsla(160, 100%, 49%, 1)",
        "hsla(160, 100%, 52%, 1)",
        "hsla(160, 100%, 54%, 1)",
        "hsla(160, 100%, 57%, 1)",
        "hsla(160, 100%, 60%, 1)",
        "hsla(250, 50%, 90%, 1)",
        "hsla(250, 50%, 95%, 1)",
      ],
      light: [
        "hsla(160, 100%, 68%, 1)",
        "hsla(160, 100%, 68%, 1)",
        "hsla(160, 100%, 67%, 1)",
        "hsla(160, 100%, 67%, 1)",
        "hsla(160, 100%, 67%, 1)",
        "hsla(160, 100%, 66%, 1)",
        "hsla(160, 100%, 66%, 1)",
        "hsla(160, 100%, 66%, 1)",
        "hsla(160, 100%, 65%, 1)",
        "hsla(160, 100%, 65%, 1)",
        "hsla(250, 50%, 95%, 1)",
        "hsla(250, 50%, 95%, 1)",
      ],
    },
  },

  childrenThemes: {
    warning: {
      palette: {
        dark: Object.values(Colors.yellowDark),
        light: Object.values(Colors.yellow),
      },
    },

    error: {
      palette: {
        dark: Object.values(Colors.redDark),
        light: Object.values(Colors.red),
      },
    },

    success: {
      palette: {
        dark: Object.values(Colors.greenDark),
        light: Object.values(Colors.green),
      },
    },
  },

  // optionally add more, can pass palette or template

  // grandChildrenThemes: {
  //   alt1: {
  //     template: 'alt1',
  //   },
  //   alt2: {
  //     template: 'alt2',
  //   },
  //   surface1: {
  //     template: 'surface1',
  //   },
  //   surface2: {
  //     template: 'surface2',
  //   },
  //   surface3: {
  //     template: 'surface3',
  //   },
  // },
});

export type Themes = typeof builtThemes;

// the process.env conditional here is optional but saves web client-side bundle
// size by leaving out themes JS. tamagui automatically hydrates themes from CSS
// back into JS for you, and the bundler plugins set TAMAGUI_ENVIRONMENT. so
// long as you are using the Vite, Next, Webpack plugins this should just work,
// but if not you can just export builtThemes directly as themes:
export const themes: Themes =
  process.env.TAMAGUI_ENVIRONMENT === "client" &&
  process.env.NODE_ENV === "production"
    ? ({} as any)
    : (builtThemes as any);

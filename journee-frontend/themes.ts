import * as Colors from "@tamagui/colors";
import { createThemes, defaultComponentThemes } from "@tamagui/theme-builder";

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

// ====================================================================
// KHỐI CODE TẠO MÀU (được giả định là tồn tại trong file của bạn)
// Logic: Giữ H và S, thay đổi L để tạo dải 12 bước.

// Lưu ý: Các hàm getHslaComponents và create12StepPalette đã được sử dụng
// trong các câu trả lời trước để tạo ra các mảng dưới đây.
// Tôi sẽ dán trực tiếp các mảng kết quả vào builtThemes.
// ====================================================================

const builtThemes = createThemes({
  componentThemes: defaultComponentThemes,

  // Thuộc tính BASE giữ các màu nền, phụ và các giá trị EXTRA
  base: {
    // Use the 12-step palettes defined above for base palettes
    palette: {
      // Bảng màu 12 bước trung lập (không đổi)

      dark: [
        "hsla(198, 56%, 93%, 1)", // 0 - Giá trị GỐC (cho dark mode)
        "hsla(198, 56%, 83%, 1)",
        "hsla(198, 56%, 74%, 1)",
        "hsla(198, 56%, 65%, 1)",
        "hsla(198, 56%, 56%, 1)",
        "hsla(198, 56%, 47%, 1)",
        "hsla(198, 56%, 38%, 1)",
        "hsla(198, 56%, 29%, 1)",
        "hsla(198, 56%, 20%, 1)",
        "hsla(198, 56%, 10%, 1)",
        "hsla(198, 50%, 5%, 1)", // 10
        "hsla(198, 50%, 10%, 1)", // 11
      ],
      light: [
        "hsla(198, 56%, 7%, 1)", // 0 - Giá trị GỐC (cho light mode)
        "hsla(198, 56%, 14%, 1)",
        "hsla(198, 56%, 23%, 1)",
        "hsla(198, 56%, 32%, 1)",
        "hsla(198, 56%, 41%, 1)",
        "hsla(198, 56%, 50%, 1)",
        "hsla(198, 56%, 59%, 1)",
        "hsla(198, 56%, 68%, 1)",
        "hsla(198, 56%, 77%, 1)",
        "hsla(198, 56%, 90%, 1)",
        "hsla(198, 50%, 90%, 1)", // 10
        "hsla(198, 50%, 95%, 1)", // 11
      ],
    },

    // Các token màu đơn lẻ (background, secondary) được đặt trong extra
    extra: {
      light: {
        // Giá trị GỐC từ bảng màu light:
        primary: "hsla(201, 72%, 75%, 1)", // 0 - Giá trị gốc

        background: "hsla(204, 67%, 98%, 1)",
        secondary: "hsla(197, 69%, 34%, 1)",
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...lightShadows,
        shadowColor: lightShadows.shadow1,
        transparent: "hsla(0,0%,0%,0)",
        static1: "hsla(0, 0%, 0%, 0.5)", // Semi-transparent black
        static2: "hsla(0, 0%, 94%, 1)", // Very light gray
        static3: "hsla(0, 0%, 9%, 1)", // Very dark gray
        static4: "hsla(0, 0%, 88%, 1)", // Light gray
        static5: "hsla(160, 76%, 38%, 1)", // Green accent
        static6: "hsla(0, 0%, 100%, 0.15)", // White 15% opacity
        static7: "hsla(0, 0%, 100%, 0.1)", // White 10% opacity
        static8: "hsla(0, 0%, 100%, 0.05)", // White 5% opacity
        static9: "hsla(0, 0%, 100%, 0.3)", // White 30% opacity
        static10: "hsla(0, 0%, 16%, 1)", // Dark gray
        static11: "hsla(0, 0%, 100%, 0.03)", // White 3% opacity
        static12: "hsla(0, 0%, 0%, 0.8)", // Black 80% opacity
        static13: "hsla(0, 0%, 25%, 1)",
        static14: "hsla(0, 0%, 100%, 0.2)",
        static15: "hsla(0,0%,0%,0.5)",
      },
      dark: {
        // Giá trị GỐC từ bảng màu dark:
        primary: "hsla(201, 72%, 76%, 1)",
        background: "hsla(204, 35%, 6%, 1)",
        secondary: "hsla(229, 53%, 34%, 1)",
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...darkShadows,
        shadowColor: darkShadows.shadow1,
        transparent: "hsla(0,0%,0%,0)",
        static1: "hsla(0, 0%, 88%, 0.5)", // Light gray 50% opacity
        static2: "hsla(0, 0%, 6%, 1)", // Very dark gray
        static3: "hsla(0, 0%, 100%, 1)", // Pure white
        static4: "hsla(0, 0%, 88%, 0.2)", // Light gray 20% opacity
        static5: "hsla(160, 76%, 38%, 1)", // Green accent (same as dark)
        static6: "hsla(0, 0%, 0%, 0.05)", // Black 5% opacity
        static7: "hsla(0, 0%, 0%, 0.1)", // Black 10% opacity
        static8: "hsla(0, 0%, 0%, 0.15)", // Black 15% opacity
        static9: "hsla(0, 0%, 0%, 0.3)", // Black 30% opacity
        static10: "hsla(0, 0%, 88%, 1)", // Light gray
        static11: "hsla(0, 0%, 0%, 0.03)", // Black 3% opacity
        static12: "hsla(0, 0%, 100%, 0.8)", // White 80% opacity
        static13: "hsla(0,0%,92%,1)",
        static14: "hsla(0,0%,0%,0.2)",
        static15: "hsla(0,0%,100%,0.5)",
      },
    },
  },

  // 3. ACCENT (Dark Base: hsla(236, 55%, 55%, 1) | Light Base: hsla(168, 88%, 43%, 1))
  accent: {
    palette: {
      dark: [
        "hsla(236, 55%, 55%, 1)", // 0 - Giá trị GỐC (cho dark mode)
        "hsla(236, 55%, 59%, 1)",
        "hsla(236, 55%, 64%, 1)",
        "hsla(236, 55%, 69%, 1)",
        "hsla(236, 55%, 74%, 1)",
        "hsla(236, 55%, 79%, 1)",
        "hsla(236, 55%, 83%, 1)",
        "hsla(236, 55%, 86%, 1)",
        "hsla(236, 55%, 90%, 1)",
        "hsla(236, 55%, 90%, 1)",
        "hsla(236, 55%, 90%, 1)", // 10
        "hsla(236, 55%, 95%, 1)", // 11
      ],
      light: [
        "hsla(164, 92%, 52%, 1)", // 0 - Giá trị GỐC (cho light mode)
        "hsla(164, 92%, 43%, 1)",
        "hsla(164, 92%, 34%, 1)",
        "hsla(164, 92%, 30%, 1)",
        "hsla(164, 92%, 25%, 1)",
        "hsla(164, 92%, 21%, 1)",
        "hsla(164, 92%, 16%, 1)",
        "hsla(164, 92%, 12%, 1)",
        "hsla(164, 92%, 10%, 1)",
        "hsla(164, 92%, 10%, 1)",
        "hsla(164, 92%, 5%, 1)", // 10
        "hsla(164, 92%, 10%, 1)", // 11
      ],
    },
  },

  childrenThemes: {
    static: {
      palette: {
        dark: [
          "hsla(0, 0%, 0%, 0.5)",
          "hsla(0, 0%, 94%, 1)",
          "hsla(0, 0%, 9%, 1)",
          "hsla(0, 0%, 88%, 1)",
          "hsla(160, 76%, 38%, 1)",
          "hsla(0, 0%, 100%, 0.15)",
          "hsla(0, 0%, 100%, 0.1)",
          "hsla(0, 0%, 100%, 0.05)",
          "hsla(0, 0%, 100%, 0.3)",
          "hsla(0, 0%, 16%, 1)",
          "hsla(0, 0%, 100%, 0.03)",
          "hsla(0, 0%, 0%, 0.8)",
        ],
        light: [
          "hsla(0, 0%, 88%, 0.5)",
          "hsla(0, 0%, 6%, 1)",
          "hsla(0, 0%, 100%, 1)",
          "hsla(0, 0%, 88%, 0.2)",
          "hsla(160, 76%, 38%, 1)",
          "hsla(0, 0%, 0%, 0.05)",
          "hsla(0, 0%, 0%, 0.1)",
          "hsla(0, 0%, 0%, 0.15)",
          "hsla(0, 0%, 0%, 0.3)",
          "hsla(0, 0%, 88%, 1)",
          "hsla(0, 0%, 0%, 0.03)",
          "hsla(0, 0%, 100%, 0.8)",
        ],
      },
      template: "base",
    },
    primary: {
      palette: {
        dark: [
          "hsla(201, 72%, 75%, 1)",
          "hsla(201, 72%, 80%, 1)",
          "hsla(201, 72%, 83%, 1)",
          "hsla(201, 72%, 85%, 1)",
          "hsla(201, 72%, 87%, 1)",
          "hsla(201, 72%, 88%, 1)",
          "hsla(201, 72%, 90%, 1)",
          "hsla(201, 72%, 92%, 1)",
          "hsla(201, 50%, 90%, 1)",
          "hsla(201, 50%, 92%, 1)",
          "hsla(201, 50%, 94%, 1)",
          "hsla(201, 50%, 95%, 1)",
        ],
        light: [
          "hsla(201, 72%, 75%, 1)",
          "hsla(201, 72%, 58%, 1)",
          "hsla(201, 72%, 51%, 1)",
          "hsla(201, 72%, 43%, 1)",
          "hsla(201, 72%, 35%, 1)",
          "hsla(201, 72%, 28%, 1)",
          "hsla(201, 72%, 20%, 1)",
          "hsla(201, 72%, 15%, 1)",
          "hsla(201, 72%, 10%, 1)",
          "hsla(201, 50%, 8%, 1)",
          "hsla(201, 50%, 5%, 1)",
          "hsla(201, 50%, 3%, 1)",
        ],
      },
      template: "base",
    },
  },
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

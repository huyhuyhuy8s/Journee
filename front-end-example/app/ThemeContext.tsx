// import { createContext, useContext, useReducer } from "react";

// const themeReducer = (state, action) => {
//   switch (action.type) {
//     case "LIGHT":
//       break;

//     case "DARK":
//       break;

//     default:
//       break;
//   }
// };

// const ThemeContext = createContext();

// export const ThemeContextProvider = ({ children }: any) => {
//   const [theme, themeDispatch] = useReducer(themeReducer, "dark");

//   return (
//     <ThemeContext.Provider value={[theme, themeDispatch]}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useThemeValue = () => {
//   const themeAndDispatch = useContext(ThemeContext);
//   return themeAndDispatch[0];
// };

// export const useThemeDispatch = () => {
//   const themeAndDispatch = useContext(ThemeContext);
//   return themeAndDispatch[1];
// };

// export default ThemeContext;

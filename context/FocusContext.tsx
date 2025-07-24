import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FocusContextType {
  totalFocusTime: number;
  setTotalFocusTime: React.Dispatch<React.SetStateAction<number>>;
  liveFocusTime: number;
  setLiveFocusTime: React.Dispatch<React.SetStateAction<number>>;
}

const FocusContext = createContext<FocusContextType>({
  totalFocusTime: 0,
  setTotalFocusTime: () => {},
  liveFocusTime: 0,
  setLiveFocusTime: () => {},
});

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [liveFocusTime, setLiveFocusTime] = useState(0);

  const contextValue = useMemo(
    () => ({
      totalFocusTime,
      setTotalFocusTime,
      liveFocusTime,
      setLiveFocusTime,
    }),
    [totalFocusTime, liveFocusTime]
  );

  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocusContext = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error("useFocusContext must be used within a FocusProvider");
  }
  return context;
};

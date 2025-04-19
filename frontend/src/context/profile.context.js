import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase";

const ProfileContext = createContext();
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    console.log("useEffect ran");
    const authUnsub = auth.onAuthStateChanged(async (authObj) => {
      console.log("onAuthStateChanged");
      if (authObj) {
        const data = {
          uid: authObj.uid,
          email: authObj.email,
          avatar: authObj.photoURL,
          name: authObj.displayName,
        };
        setProfile(data);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return () => {
      authUnsub();
    };
  }, []);
  const signOut = () => {
    auth.signOut();
  };
  return (
    <ProfileContext.Provider value={{ profile, isLoading, signOut }}>
      {children}
    </ProfileContext.Provider>
  );
};
export const useProfile = () => {
  return useContext(ProfileContext);
};

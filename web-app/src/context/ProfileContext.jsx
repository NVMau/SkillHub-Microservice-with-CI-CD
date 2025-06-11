import React, { useState, createContext, useContext, useEffect } from 'react';
import { getMyProfile } from "../services/userService"; // Hàm lấy thông tin người dùng

// Tạo context
export const ProfileContext = createContext();

// Component quản lý context
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyProfile();
      setProfile(response.data); // Cập nhật profile khi nhận được từ API
    } catch (error) {
      console.error("Lỗi khi lấy profile", error);
      setError(error.message || "Có lỗi xảy ra khi tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log("ProfileContext mounted, calling fetchProfile");
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Profile state changed:", profile);
  }, [profile]);

  const resetProfile = () => setProfile(null);

  const value = {
    profile,
    loading,
    error,
    fetchProfile,
    resetProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Hook để sử dụng ProfileContext ở các component con
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

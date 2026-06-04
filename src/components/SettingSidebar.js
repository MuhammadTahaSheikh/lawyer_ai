import React, { useState, useEffect } from "react";
import { List, ListItem, Typography, Divider, Sheet, ListItemButton, IconButton, Drawer } from "@mui/joy";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import { useMediaQuery } from "@mui/material";
import axios from "axios";
import { auth } from "../firebase/firebase";

const SettingsSidebar = ({ setShowSettingsSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isSmallScreen = useMediaQuery("(max-width: 768px)"); // Detect small screens
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [profileImage, setProfileImage] = useState("");

    const [user, setUser] = useState("");
    const loggedInUidd = auth.currentUser?.uid;

    const fetchUsers = async () => {
        try {
            const response = await axios.get("/active-users");
            setActiveUsers(response.data.activeUsers);
            const loggedInUser = response.data.activeUsers.find(
                (u) => u.uid === loggedInUidd
            );
            if (loggedInUser) {
                setUser(loggedInUser);
            }
        } catch (error) {
            console.error("Error fetching active users:", error);
        }
    };
    const fetchProfileImage = async () => {
        try {
            const response = await axios.get(`/users/${loggedInUidd}/profile-image`);
            if (response.data.imageUrl) {
                setProfileImage(response.data.imageUrl); // Load image preview

            }
        } catch (error) {
            console.error("Failed to fetch profile image:", error);
        }
    };
    useEffect(() => {


        if (loggedInUidd) {
            fetchProfileImage();
        }
    }, [loggedInUidd]);
    useEffect(() => {
        fetchUsers();
    }, []);
    const handleBackClick = () => {
        navigate("/");
        setShowSettingsSidebar(false);
    };

    return (
        <>
            {isSmallScreen ? (
                <>
                    <IconButton onClick={() => setDrawerOpen(true)} sx={{ position: "absolute", top: 10, left: 10 }}>
                        <MenuIcon />
                    </IconButton>
                    <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                        <Sheet
                            sx={{
                                width: 240,
                                height: "100vh",
                                position: "fixed",
                                left: 0,
                                top: 0,
                                padding: 2,
                                backgroundColor: "background.surface",
                                boxShadow: "md",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <List sx={{ width: 250, p: 2, borderRight: "1px solid #ccc" }}>
                                    {/* General Section */}
                                    <Typography level="h5" sx={{ mb: 1 }}>General</Typography>
                                    <Divider />

                                    <ListItem>
                                        <ListItemButton
                                            component={Link}
                                            to="/custom-field"
                                            onClick={() => setShowSettingsSidebar(true)}
                                            sx={{ backgroundColor: location.pathname === "/custom-field" ? "#cde2f2" : "transparent", color: location.pathname === "/custom-field" ? "#000" : "inherit" }}
                                        >
                                            Custom Fields
                                        </ListItemButton>
                                    </ListItem>


                                    <ListItem>
                                        <ListItemButton
                                            component={Link}
                                            to="/case-stages"
                                            onClick={() => setShowSettingsSidebar(true)}
                                            sx={{ backgroundColor: location.pathname === "/case-stages" ? "#cde2f2" : "transparent", color: location.pathname === "/case-stages" ? "#000" : "inherit" }}
                                        >
                                            Case Stages
                                        </ListItemButton>
                                    </ListItem>


                                    {/* Personal Section */}
                                    <Typography level="h5" sx={{ mt: 2, mb: 1 }}>Personal</Typography>
                                    <Divider />
                                    <ListItemButton
                                        onClick={() => {
                                            navigate("/profile/edit", {
                                                state: {
                                                    userId: user?.uid,
                                                    user,
                                                    imageUrl: profileImage
                                                }
                                            });
                                            setShowSettingsSidebar(true);
                                        }}
                                    >
                                        My Profile
                                    </ListItemButton>




                                    {/* Firm Section */}
                                    <Typography level="h5" sx={{ mt: 2, mb: 1 }}>Firm</Typography>
                                    <Divider />
                                    <ListItem>
                                        <ListItemButton
                                            component={Link}
                                            to="/firm-users"
                                            onClick={() => setShowSettingsSidebar(true)}
                                            sx={{ backgroundColor: location.pathname === "/firm-users" ? "#cde2f2" : "transparent", color: location.pathname === "/settings/firm-users" ? "#000" : "inherit" }}
                                        >
                                            Firm Users
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "10px" }}>
                                <IconButton onClick={handleBackClick} sx={{ mb: 2 }}>
                                    <ArrowBackIcon />
                                </IconButton>
                            </div>
                        </Sheet>
                    </Drawer>
                </>
            ) : (
                <Sheet
                    sx={{
                        width: 240,
                        height: "100vh",
                        position: "fixed",
                        left: 0,
                        top: 0,
                        padding: 2,
                        backgroundColor: "background.surface",
                        boxShadow: "md",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <List sx={{ width: 250, p: 2, borderRight: "1px solid #ccc" }}>
                            {/* General Section */}
                            <Typography level="h5" sx={{ mb: 1 }}>General</Typography>
                            <Divider />

                            <ListItem>
                                <ListItemButton
                                    component={Link}
                                    to="/custom-field"
                                    onClick={() => setShowSettingsSidebar(true)}
                                    sx={{ backgroundColor: location.pathname === "/custom-field" ? "#cde2f2" : "transparent", color: location.pathname === "/custom-field" ? "#000" : "inherit" }}
                                >
                                    Custom Fields
                                </ListItemButton>
                            </ListItem>


                            <ListItem>
                                <ListItemButton
                                    component={Link}
                                    to="/case-stages"
                                    onClick={() => setShowSettingsSidebar(true)}
                                    sx={{ backgroundColor: location.pathname === "/case-stages" ? "#cde2f2" : "transparent", color: location.pathname === "/case-stages" ? "#000" : "inherit" }}
                                >
                                    Case Stages
                                </ListItemButton>
                            </ListItem>


                            {/* Personal Section */}
                            <Typography level="h5" sx={{ mt: 2, mb: 1 }}>Personal</Typography>
                            <Divider />
                            <ListItemButton
                                onClick={() => {
                                    navigate("/profile/edit", {
                                        state: {
                                            userId: user?.uid,
                                            user,
                                            imageUrl: profileImage
                                        }
                                    });
                                    setShowSettingsSidebar(true);
                                }}
                            >
                                My Profile
                            </ListItemButton>




                            {/* Firm Section */}
                            <Typography level="h5" sx={{ mt: 2, mb: 1 }}>Firm</Typography>
                            <Divider />
                            <ListItem>
                                <ListItemButton
                                    component={Link}
                                    to="/firm-users"
                                    onClick={() => setShowSettingsSidebar(true)}
                                    sx={{ backgroundColor: location.pathname === "/firm-users" ? "#cde2f2" : "transparent", color: location.pathname === "/settings/firm-users" ? "#000" : "inherit" }}
                                >
                                    Firm Users
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "10px" }}>
                        <IconButton onClick={handleBackClick} sx={{ mb: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                    </div>
                </Sheet>
            )}
        </>
    );
};

export default SettingsSidebar;

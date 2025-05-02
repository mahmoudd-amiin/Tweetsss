import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ChakraProvider, Box, Flex, Button } from "@chakra-ui/react";
import VisitorView from "./pages/VisitorView";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

const Navbar = () => (
  <Box
    bg="black"
    px={{ base: 2, md: 6 }} // تقليل الـ px على الشاشات الصغيرة
    py={4}
    borderBottom="1px solid white"
    position="sticky"
    top={0}
    zIndex={1000}
  >
    <Flex maxW="1200px" mx="auto" align="center" justify="space-between">
      <Link to="/">
        <Button
          variant="ghost"
          bg="transparent"
          color="white"
          fontWeight="bold"
          fontSize={{ base: "sm", md: "md" }} // تصغير حجم الخط على الشاشات الصغيرة
          px={{ base: 4, md: 6 }} // تقليل الـ px على الشاشات الصغيرة
          _hover={{ bg: "transparent", color: "white", transform: "none" }}
          transition="none"
        >
          Visitors
        </Button>
      </Link>
      <Link to="/login">
        <Button
          variant="ghost"
          bg="transparent"
          color="white"
          fontWeight="bold"
          fontSize={{ base: "sm", md: "md" }} // تصغير حجم الخط على الشاشات الصغيرة
          px={{ base: 4, md: 6 }} // تقليل الـ px على الشاشات الصغيرة
          _hover={{ bg: "transparent", color: "white", transform: "none" }}
          transition="none"
        >
          Admin
        </Button>
      </Link>
    </Flex>
  </Box>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<VisitorView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);

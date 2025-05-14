import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import {
    Box,
    Text,
    Heading,
    VStack,
    Spinner,
    Button,
    useToast,
    Flex,
    IconButton, // هنستخدم IconButton عشان شكله ممكن يكون أنسب
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons"; // أيقونة الإغلاق اللي شكلها زي علامة سالب
import { useNavigate } from "react-router-dom";

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/login");
            } else {
                const q = query(collection(db, "anonymousMessages"), orderBy("createdAt", "desc"));
                const unsubscribeMessages = onSnapshot(q, (snapshot) => {
                    const fetchedMessages = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setMessages(fetchedMessages);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching messages:", error);
                    toast({
                        title: "فشل تحميل الرسائل",
                        status: "error",
                        duration: 2000,
                        isClosable: true,
                    });
                    setLoading(false);
                });

                return () => {
                    unsubscribeMessages();
                };
            }
        });

        return () => unsubscribeAuth();
    }, [navigate, toast]);

    const handleDeleteMessage = async (id) => {
        try {
            await deleteDoc(doc(db, "anonymousMessages", id));
            toast({
                title: "تم حذف الرسالة بنجاح",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error deleting message:", error);
            toast({
                title: "فشل حذف الرسالة",
                description: "يرجى المحاولة مرة أخرى.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
                <Text mt={4}>جاري تحميل الرسائل...</Text>
            </Box>
        );
    }

    return (
        <Box p={4} bg="black" minH="100vh" color="white" display="flex" flexDirection="column" alignItems="center">
            <VStack spacing={4} w="95%" maxW={{ base: "95%", md: "800px" }} align="center" textAlign="center" marginTop={{ base: "10px", md: "0" }}>
                <Heading mb={6} textAlign="center" color="teal.300" fontSize={{ base: 'xl', md: '2xl' }}>
                    الرسائل المجهولة
                </Heading>

                <Button
                    mb={6}
                    colorScheme="teal"
                    onClick={() => navigate("/admin")}
                    borderRadius="full"
                    size={{ base: 'sm', md: 'md' }}
                >
                    رجوع للوحة التحكم
                </Button>

                {messages.length === 0 ? (
                    <Text fontSize="lg" color="gray.400">لا توجد رسائل حالياً.</Text>
                ) : (
                    messages.map((msg) => (
                        <Flex
                            key={msg.id}
                            p={4}
                            bg="black"
                            borderRadius="lg"
                            boxShadow="lg"
                            border="2px solid"
                            borderColor="whiteAlpha.300"
                            backdropFilter="blur(10px)"
                            w="100%"
                            alignItems="center" // عشان نخلي النص والزر في نفس الخط
                            justifyContent="space-between" // عشان نفصل بينهم
                        >
                            <Box textAlign="center">
                                <Text fontSize={{ base: "lg", md: "xl" }} lineHeight={1.4} mb={2} color="white" fontWeight="bold">
                                    {msg.text}
                                </Text>
                                <Text mt={2} fontSize="sm" color="gray.400">
                                    {msg.createdAt?.toDate?.().toLocaleString() || "وقت غير معروف"}
                                </Text>
                            </Box>
                            <IconButton
                                aria-label="حذف الرسالة"
                                icon={<CloseIcon />} // استخدام أيقونة الإغلاق اللي شكلها زي علامة سالب
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleDeleteMessage(msg.id)}
                            />
                        </Flex>
                    ))
                )}
            </VStack>
        </Box>
    );
};

export default AdminMessages;
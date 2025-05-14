import { useState } from "react";
import {
    Box,
    Button,
    Textarea,
    Text,
    useToast,
    VStack,
    Heading,
    Flex,
} from "@chakra-ui/react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AnonymousMessage = () => {
    const [message, setMessage] = useState("");
    const toast = useToast();

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast({
                title: "الرسالة فارغة",
                description: "يرجى كتابة رسالة قبل الإرسال.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await addDoc(collection(db, "anonymousMessages"), {
                text: message,
                createdAt: serverTimestamp(),
            });

            setMessage("");
            toast({
                title: "تم إرسال الرسالة بنجاح",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "حدث خطأ أثناء الإرسال",
                description: "يرجى المحاولة لاحقًا.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Flex
            direction="column"
            align="center"
            justify="center" // استخدام center بدلاً من space-between لتجميع العناصر في المنتصف
            bg="gray.900"
            color="white"
            minH="100vh"
            mt={{ base: -2, md: -8 }} // تقليل البادينج العام على الموبايل
        >
            <Box textAlign="center" mb={4}> {/* زيادة الهامش شوية عشان ميكونش لازق في اللي بعده */}
                <Heading fontSize="2xl" fontWeight="bold" mb={8}> {/* تصغير حجم الخط للعنوان على الموبايل وتقليل الهامش */}
                    Mahmoud أرسل رسالة مجهولة إلي
                </Heading>
            </Box>

            <Box
                w="90%" // جعل عرض مربع النص والزر أقل عشان يبقى فيه مساحة على الجوانب
                maxW="400px" // تقليل الحد الأقصى للعرض على الموبايل
                mb={20} // تقليل الهامش السفلي لمربع النص
                borderRadius="md"
                overflow="hidden"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.6)"
            >
                <Textarea
                    placeholder="اكتب رسالتك هنا..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    size="md" // تصغير حجم الـ textarea قليلاً على الموبايل
                    bg="gray.800"
                    borderColor="gray.700"
                    _focus={{ borderColor: "teal.500" }}
                    color="white"
                    rows={6} // تقليل عدد الصفوف الافتراضي على الموبايل
                    resize="none"
                />
            </Box>

            <Button
                colorScheme="teal"
                onClick={handleSubmit}
                isFullWidth
                size="lg"
                borderRadius="full"
                boxShadow="md"
                _hover={{ boxShadow: "lg" }}
                _active={{ boxShadow: "sm" }}
            >
                إرسال الرسالة
            </Button>

            <Box h={2} /> {/* مساحة بسيطة في الأسفل */}
        </Flex>
    );
};

export default AnonymousMessage;
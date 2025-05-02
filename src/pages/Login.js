import { useState } from 'react';
import {
    Box,
    Button,
    Input,
    Heading,
    VStack,
    useToast,
    Container,
    Text,
    Link, // استيراد Link من Chakra UI لو هتعرض رابط "نسيت كلمة المرور"
} from '@chakra-ui/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const toast = useToast();
    const navigate = useNavigate();
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [disableLogin, setDisableLogin] = useState(false);

    const handleLogin = async () => {
        if (disableLogin) {
            toast({
                title: 'محاولات تسجيل دخول متكررة',
                description: 'يرجى الانتظار قليلًا ثم المحاولة مرة أخرى.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: 'تم تسجيل الدخول بنجاح',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            navigate('/admin');
        } catch (error) {
            setLoginAttempts(prevAttempts => prevAttempts + 1);
            toast({
                title: 'فشل تسجيل الدخول',
                description: 'يرجى التحقق من البريد الإلكتروني وكلمة المرور.', // رسالة خطأ عامة
                status: 'error',
                duration: 3000,
                isClosable: true,
            });

            if (loginAttempts >= 3) {
                setDisableLogin(true);
                setTimeout(() => {
                    setDisableLogin(false);
                    setLoginAttempts(0);
                }, 60000); // تعطيل الزر لمدة دقيقة (مثال) - يجب تطبيق آلية أقوى على الـ Backend
            }
        }
    };

    return (
        <Box bg="black" minH="100vh" color="white" display="flex" alignItems="center" justifyContent="center">
            <Container maxW="sm" p={6} bg="black" border="2px solid"
                borderColor="whiteAlpha.300" borderRadius="lg" boxShadow="lg">
                <VStack spacing={5}>
                    <Heading size="lg"> تسجيل الدخول</Heading>
                    <Text fontSize="sm" color="gray.400">أدخل بيانات الدخول للوصول إلى لوحة التحكم</Text>
                    <Input
                        placeholder="البريد الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        bg="gray.700"
                        border="none"
                        type="email" // إضافة نوع الإدخال للبريد الإلكتروني
                    />
                    <Input
                        placeholder="كلمة المرور"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        bg="gray.700"
                        border="none"
                    />
                    {/* إضافة رابط "نسيت كلمة المرور" لو كانت الصفحة موجودة */}
                    {/* <Link href="/forgot-password" fontSize="sm" alignSelf="flex-end" color="teal.300">
                        نسيت كلمة المرور؟
                    </Link> */}
                    <Button colorScheme="teal" width="full" onClick={handleLogin} isLoading={false} // ممكن تضيف حالة تحميل هنا
                        isDisabled={disableLogin}>
                        دخول
                    </Button>
                    {disableLogin && (
                        <Text fontSize="sm" color="yellow.400" textAlign="center">
                            محاولات تسجيل دخول متكررة. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.
                        </Text>
                    )}
                </VStack>
            </Container>
        </Box>
    );
};

export default Login;
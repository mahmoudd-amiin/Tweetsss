import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  Spinner,
  Input,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";

const Admin = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        const fetchTweets = async () => {
          try {
            const q = query(collection(db, "tweets"), orderBy("startTime", "desc"));
            const querySnapshot = await getDocs(q);
            const tweetsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTweets(tweetsData);
          } catch (error) {
            console.error("Error fetching tweets: ", error);
          } finally {
            setLoading(false);
          }
        };
        fetchTweets();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth)
      .then(() => {
        navigate("/login");
        window.history.replaceState({}, '', '/login');
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        toast({
          title: "فشل تسجيل الخروج",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      });
  };

  const handleDeleteTweet = async (id) => {
    try {
      await deleteDoc(doc(db, "tweets", id));
      setTweets((prevTweets) => prevTweets.filter(tweet => tweet.id !== id));
      toast({
        title: "تم حذف التغريدة",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting tweet: ", error);
      toast({
        title: "فشل حذف التغريدة",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleAddTweet = async () => {
    if (newTweet.trim()) {
      try {
        const tweetCollection = collection(db, "tweets");
        const docRef = await addDoc(tweetCollection, {
          text: newTweet,
          startTime: new Date(),
          endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
          likedBy: [],
        });

        setTweets((prevTweets) => [
          { id: docRef.id, text: newTweet, startTime: new Date(), endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), likedBy: [] },
          ...prevTweets,
        ]);

        setNewTweet('');
        toast({
          title: "تم إضافة التغريدة",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error adding tweet: ", error);
        toast({
          title: "فشل إضافة التغريدة",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "التغريدة فارغة",
        description: "يرجى كتابة نص التغريدة.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={4}>جاري تحميل التغريدات...</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg="gray.800" minH="100vh" color="white">
      <Heading mb={6} textAlign="center" color="teal.400">لوحة التحكم - الأدمن</Heading>

      <Button colorScheme="red" onClick={handleLogout} mb={6} w="100%" borderRadius="full">
        تسجيل الخروج
      </Button>

      {/* إضافة تغريدة جديدة (نص فقط) */}
      <VStack spacing={4} mb={6} align="stretch">
        <Input
          placeholder="أضف تغريدة جديدة"
          value={newTweet}
          onChange={(e) => setNewTweet(e.target.value)}
          bg="gray.700"
          borderColor="gray.600"
          _focus={{ borderColor: "teal.400" }}
          color="white"
          borderRadius="md"
        />
        <Button
          colorScheme="teal"
          onClick={handleAddTweet}
          borderRadius="md"
        >
          إضافة تغريدة
        </Button>
      </VStack>

      {/* عرض التغريدات */}
      <VStack spacing={6}>
        {tweets.length === 0 ? (
          <Text>لا توجد تغريدات حالياً.</Text>
        ) : (
          tweets.map((tweet) => (
            <Box
              key={tweet.id}
              p={6}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="md"
              bg="gray.700"
              w="100%"
              _hover={{ boxShadow: "lg" }}
            >
              <Flex justify="space-between" alignItems="center" mb={2}>
                <Text fontSize="lg">{tweet.text}</Text>
                <Flex alignItems="center">
                  <FaHeart color="red" mr={2} />
                  <Text fontSize="sm" color="gray.400">
                    {(tweet.likedBy || []).length}
                  </Text>
                </Flex>
              </Flex>
              {tweet.audioUrl && (
                <audio src={tweet.audioUrl} controls style={{ width: '100%', marginBottom: '1rem' }} />
              )}
              <Text color="gray.400" fontSize="sm" mb={4}>
                تبدأ من: {tweet.startTime instanceof Date ? tweet.startTime.toLocaleString() : (tweet.startTime?.toDate()?.toLocaleString() || 'Invalid Date')} |
                تنتهي في: {tweet.endTime instanceof Date ? tweet.endTime.toLocaleString() : (tweet.endTime?.toDate()?.toLocaleString() || 'Invalid Date')}
              </Text>
              <Button colorScheme="red" onClick={() => handleDeleteTweet(tweet.id)} borderRadius="md">
                حذف التغريدة
              </Button>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default Admin;
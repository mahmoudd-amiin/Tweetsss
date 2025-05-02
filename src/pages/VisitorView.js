import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { Box, Text, Spinner, VStack, IconButton, Flex } from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";

const LIKED_TWEETS_KEY = 'likedTweets';
const VISITED_TODAY_KEY = 'visitedToday';

const getAnonymousUserId = () => {
  let userId = localStorage.getItem('anonymousUserId');
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('anonymousUserId', userId);
  }
  return userId;
};

const VisitorView = () => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intervalIds, setIntervalIds] = useState({});
  const [likedTweets, setLikedTweets] = useState(() => {
    const storedLikes = localStorage.getItem(LIKED_TWEETS_KEY);
    return storedLikes ? JSON.parse(storedLikes) : {};
  });
  const currentUserId = getAnonymousUserId();

  useEffect(() => {
    // تتبع الزيارات الفريدة يوميًا
    const trackUniqueDailyVisit = () => {
      const visitedToday = localStorage.getItem(VISITED_TODAY_KEY);

      if (!visitedToday) {
        fetch('/api/increment-visit-count', { method: 'POST' })
          .then(response => {
            if (response.ok) {
              const now = new Date();
              const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
              const timeToExpiry = endOfDay.getTime() - now.getTime();
              localStorage.setItem(VISITED_TODAY_KEY, 'true');
              setTimeout(() => {
                localStorage.removeItem(VISITED_TODAY_KEY);
              }, timeToExpiry);
            } else {
              console.error('فشل تحديث عداد الزيارات.');
            }
          })
          .catch(error => {
            console.error('حدث خطأ أثناء محاولة تحديث عداد الزيارات:', error);
          });
      }
    };

    trackUniqueDailyVisit();

    const fetchTweets = async () => {
      try {
        const q = query(
          collection(db, "tweets"),
          where("endTime", ">", new Date()),
          orderBy("startTime", "desc")
        );
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
  }, []);

  useEffect(() => {
    const newIntervalIds = {};
    tweets.forEach((tweet) => {
      if (tweet.endTime) {
        const interval = setInterval(() => {
          const currentTime = new Date();
          const endTime = tweet.endTime.toDate();
          const timeDiff = endTime - currentTime;

          if (timeDiff <= 0) {
            setTweets((prevTweets) => prevTweets.filter((t) => t.id !== tweet.id));
          }
        }, 1000);
        newIntervalIds[tweet.id] = interval;
      }
    });
    Object.values(intervalIds).forEach(clearInterval);
    setIntervalIds(newIntervalIds);

    return () => {
      Object.values(intervalIds).forEach(clearInterval);
    };
  }, [tweets]);

  useEffect(() => {
    localStorage.setItem(LIKED_TWEETS_KEY, JSON.stringify(likedTweets));
  }, [likedTweets]);

  const handleLike = async (tweetId) => {
    const tweetRef = doc(db, "tweets", tweetId);
    const tweet = tweets.find(t => t.id === tweetId);
    if (!tweet) return;

    const likedBy = tweet.likedBy || [];
    const hasLiked = likedBy.includes(currentUserId);

    const updateLikesInFirebase = async (newLikedBy) => {
      try {
        await updateDoc(tweetRef, {
          likedBy: newLikedBy,
        });
      } catch (error) {
        console.error("Error updating likes: ", error);
      }
    };

    let updatedLikedTweets = { ...likedTweets };
    let updatedLikedBy = [...likedBy];

    if (!hasLiked) {
      updatedLikedBy.push(currentUserId);
      updatedLikedTweets[tweetId] = true;
    } else {
      updatedLikedBy = updatedLikedBy.filter(id => id !== currentUserId);
      delete updatedLikedTweets[tweetId];
    }

    setLikedTweets(updatedLikedTweets);

    const updatedTweets = tweets.map(t =>
      t.id === tweetId ? { ...t, likedBy: updatedLikedBy } : t
    );
    setTweets(updatedTweets);
    updateLikesInFirebase(updatedLikedBy);
  };

  const isLikedByUser = (tweetId) => {
    return likedTweets[tweetId] || false;
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" color="teal.400" />
        <Text mt={4} color="teal.400">جاري تحميل التغريدات...</Text>
      </Box>
    );
  }

  return (
    <Box
      p={4}
      bg="black"
      minH="100vh"
      color="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <VStack
        spacing={4}
        w="95%"
        maxW={{ base: "95%", md: "800px" }}
        align="center"
        textAlign="center"
        marginTop={{ base: "10px", md: "0" }}
      >
        {tweets.length > 0 ? (
          tweets.map((singleTweet) => (
            <Box
              key={singleTweet.id}
              p={4}
              bg="black"
              borderRadius="lg"
              boxShadow="lg"
              border="2px solid"
              borderColor="whiteAlpha.300"
              backdropFilter="blur(10px)"
              w="100%"
              position="relative"
            >
              <Flex position="absolute" top="0.5rem" left="0.5rem">
                <IconButton
                  aria-label="Like tweet"
                  icon={<FaHeart color={isLikedByUser(singleTweet.id) ? "red" : "white"} />}
                  variant="ghost"
                  color="white"
                  size="sm"
                  _active={{ bg: "transparent", color: "red" }}
                  onClick={() => handleLike(singleTweet.id)}
                />
              </Flex>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                lineHeight={1.4}
                mb={2}
                color="white"
                fontWeight="bold"
                textAlign="center"
                mt="1rem"
                pt="0.5rem"
              >
                {singleTweet.text}
              </Text>
              {singleTweet.audioUrl && (
                <audio src={singleTweet.audioUrl} controls style={{ width: '100%', marginTop: '1rem' }} />
              )}
            </Box>
          ))
        ) : (
          <Text fontSize="lg" color="gray.400">
            لا توجد تغريدات حالياً.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default VisitorView;
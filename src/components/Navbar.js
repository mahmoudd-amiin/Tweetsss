import { Box, Flex, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <Box bg="gray.800" px={4} py={2} color="white">
      <Flex justify="space-between">
        <Link to="/">
          <Button variant="ghost" color="white">الزوار</Button>
        </Link>
        <Link to="/login">
          <Button variant="ghost" color="white">الأدمن</Button>
        </Link>
      </Flex>
    </Box>
  );
};

export default Navbar;

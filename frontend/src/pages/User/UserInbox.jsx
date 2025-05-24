import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Layout/Header";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineArrowRight,
  AiOutlineArrowLeft,
  AiOutlineSend,
} from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import styles from "../../styles/styles";
import { getRequest, postRequest, putRequest } from "../../request/api";
import { toast } from "react-toastify";

const socketId = socketIO(process.env.ENDPOINT, { transports: ["websocket"] });

const UserInbox = () => {
  const { user } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await getRequest(`/conversation/get-all-conversation-user/${user?._id}`);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch conversations");
        }
        setConversations(res.conversations);
      } catch (error) {
        console.error("Fetch conversations error:", error);
        toast.error(error.message || "Failed to fetch conversations");
      }
    };
    getConversation();
  }, [user, messages]);

  useEffect(() => {
    if (user) {
      const userId = user?._id;
      socketId.emit("addUser", userId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== user?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);
    return online ? true : false;
  };

  useEffect(() => {
    const getMessage = async () => {
      try {
        const res = await getRequest(`/message/get-all-messages/${currentChat?._id}`);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch messages");
        }
        setMessages(res.messages);
      } catch (error) {
        console.error("Fetch messages error:", error);
        toast.error(error.message || "Failed to fetch messages");
      }
    };
    getMessage();
  }, [currentChat]);

  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find((member) => member !== user?._id);

    socketId.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      if (newMessage !== "") {
        const res = await postRequest("/message/create-new-message", message);
        if (!res.success) {
          throw new Error(res.message || "Failed to send message");
        }
        setMessages([...messages, res.message]);
        await updateLastMessage();
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.message || "Failed to send message");
    }
  };

  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: user._id,
    });

    try {
      const res = await putRequest(`/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: user._id,
      });
      if (!res.success) {
        throw new Error(res.message || "Failed to update last message");
      }
      setNewMessage("");
    } catch (error) {
      console.error("Update last message error:", error);
      toast.error(error.message || "Failed to update last message");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImages(file);
    await imageSendingHandler(file);
  };

  const imageSendingHandler = async (file) => {
    const formData = new FormData();
    formData.append("images", file);
    formData.append("sender", user._id);
    formData.append("text", newMessage);
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find((member) => member !== user._id);

    socketId.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      images: file,
    });

    try {
      const res = await postRequest("/message/create-new-message", formData);
      if (!res.success) {
        throw new Error(res.message || "Failed to send image");
      }
      setImages(null);
      setMessages([...messages, res.message]);
      await updateLastMessageForImage();
    } catch (error) {
      console.error("Send image error:", error);
      toast.error(error.message || "Failed to send image");
    }
  };

  const updateLastMessageForImage = async () => {
    try {
      const res = await putRequest(`/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: "Photo",
        lastMessageId: user._id,
      });
      if (!res.success) {
        throw new Error(res.message || "Failed to update last message for image");
      }
    } catch (error) {
      console.error("Update last message for image error:", error);
      toast.error(error.message || "Failed to update last message for image");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full">
      {!open && (
        <>
          <Header />
          <div
            className={`${styles.section} flex items-center justify-between py-3 px-4`}
          >
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center text-[20px] font-Poppins text-[#333] hover:text-[#555] transition-colors duration-200"
            >
              <AiOutlineArrowLeft size={24} className="mr-2" />
              Back
            </button>
            <h1 className="text-center text-[30px] font-Poppins flex-1">
              All Messages
            </h1>
            <div className="w-[100px]"></div>
          </div>
          <div className={`${styles.section}`}>
            {conversations &&
              conversations.map((item, index) => (
                <MessageList
                  data={item}
                  key={index}
                  index={index}
                  setOpen={setOpen}
                  setCurrentChat={setCurrentChat}
                  me={user?._id}
                  setUserData={setUserData}
                  userData={userData}
                  online={onlineCheck(item)}
                  setActiveStatus={setActiveStatus}
                />
              ))}
          </div>
        </>
      )}

      {open && (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={user._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          handleImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  userData,
  online,
  setActiveStatus,
}) => {
  const [active, setActive] = useState(0);
  const [user, setUser] = useState([]);
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/inbox?${id}`);
    setOpen(true);
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((user) => user !== me);
    const getUser = async () => {
      try {
        const res = await getRequest(`/shop/get-shop-info/${userId}`);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch shop info");
        }
        setUser(res.shop);
      } catch (error) {
        console.error("Fetch shop info error:", error);
        toast.error(error.message || "Failed to fetch shop info");
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active === index ? "bg-[#00000010]" : "bg-transparent"
      } cursor-pointer`}
      onClick={() => {
        setActive(index);
        handleClick(data._id);
        setCurrentChat(data);
        setUserData(user);
        setActiveStatus(online);
      }}
    >
      <div className="relative">
        <img
          src={user?.avatar}
          alt="Shop avatar"
          className="w-[50px] h-[50px] rounded-full"
        />
        {online ? (
          <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px]" />
        ) : (
          <div className="w-[12px] h-[12px] bg-[#c7b9b9] rounded-full absolute top-[2px] right-[2px]" />
        )}
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{user?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {data?.lastMessageId !== user?._id
            ? "You:"
            : user?.name?.split(" ")[0] + ": "}{" "}
          {data?.lastMessage}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between p-5">
      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <img
            src={userData?.avatar}
            alt="Shop avatar"
            className="w-[60px] h-[60px] rounded-full"
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
            <h1>{activeStatus ? "Active Now" : ""}</h1>
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>

      <div className="px-3 h-[75vh] py-3 overflow-y-scroll">
        {messages &&
          messages.map((item, index) => (
            <div
              className={`flex w-full my-2 ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              }`}
              ref={scrollRef}
              key={index}
            >
              {item.sender !== sellerId && (
                <img
                  src={userData?.avatar}
                  alt="Shop avatar"
                  className="w-[40px] h-[40px] rounded-full mr-3"
                />
              )}
              {item.images && (
                <img
                  src={item.images}
                  alt="Message image"
                  className="w-[300px] h-[300px] object-cover rounded-[10px] ml-2 mb-2"
                />
              )}
              {item.text !== "" && (
                <div>
                  <div
                    className={`w-max p-2 rounded ${
                      item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"
                    } text-[#fff] h-min`}
                  >
                    <p>{item.text}</p>
                  </div>
                  <p className="text-[12px] text-[#000000d3] pt-1">
                    {format(item.createdAt)}
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>

      <form
        aria-required={true}
        className="p-3 relative w-full flex justify-between items-center"
        onSubmit={sendMessageHandler}
      >
        <div className="w-[30px]">
          <input
            type="file"
            name="image"
            id="image"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <TfiGallery className="cursor-pointer" size={20} />
          </label>
        </div>
        <div className="w-full">
          <input
            type="text"
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
          <input type="submit" value="Send" className="hidden" id="send" />
          <label htmlFor="send">
            <AiOutlineSend
              size={20}
              className="absolute right-4 top-5 cursor-pointer"
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default UserInbox;
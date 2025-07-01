import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../../components/Events/EventCard";
import Header from "../../components/Layout/Header";
import Loader from "../../components/Layout/Loader";
import styles from "../../styles/styles";

const EventsPage = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Header activeHeading={4} />
          <div className={`${styles.section} mx-auto px-4 py-8`}>
            {allEvents.length !== 0 ? (
              <motion.div
                className="grid grid-cols-1 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AnimatePresence>
                  {allEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EventCard active={true} data={event} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-2xl text-gray-600 font-medium">
                  Hiện tại không có sự kiện nào.
                </p>
                <p className="text-gray-500 mt-2">
                  Vui lòng kiểm tra lại sau hoặc liên hệ với chúng tôi để biết
                  thêm thông tin!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EventsPage;

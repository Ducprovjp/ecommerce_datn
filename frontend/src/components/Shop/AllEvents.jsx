import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { deleteEvent, getAllEventsShop } from "../../redux/actions/event";
import Loader from "../Layout/Loader";

const AllEvents = () => {
  const { events, isLoading } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllEventsShop(seller._id));
  }, [dispatch, seller._id]);

  const handleDelete = (id) => {
    dispatch(deleteEvent(id));
    window.location.reload();
  };

  // Sắp xếp sự kiện theo createdAt giảm dần
  const sortedEvents = events
    ? [...events].sort((a, b) => new Date(b.createdAt.$date) - new Date(a.createdAt.$date))
    : [];

  console.log("Sorted Events:", sortedEvents);

  return (
    <div className="w-full p-8">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">All Events</h2>
          {sortedEvents.length === 0 ? (
            <p className="text-gray-600">No events found.</p>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event._id}
                className="w-full bg-white rounded-md shadow-md p-6 mb-4"
              >
                <div className="flex flex-col">
                  {/* Hiển thị sự kiện */}
                  <div className="flex items-center mb-4">
                    <img
                      src={event.images[0]}
                      alt={event.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{event.name}</h4>
                      <p className="text-xs text-gray-600">
                        Price: {event.discountPrice.toLocaleString("vi-VN")} VNĐ
                      </p>
                      <p className="text-xs text-gray-600">
                        Stock: {event.stock}
                      </p>
                      <p className="text-xs text-gray-600">
                        Sold: {event.sold_out}
                      </p>
                    </div>
                  </div>
                  {/* Nút hành động */}
                  <div className="flex justify-end space-x-2">
                    <a
                      href={`/product/${event._id}?isEvent=true`}
                      className="flex items-center bg-[#f63b60] text-white px-4 py-2 rounded-md hover:bg-[#e12c4f]"
                    >
                      Preview
                      <AiOutlineEye className="ml-2" size={20} />
                    </a>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Delete
                      <AiOutlineDelete className="ml-2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default AllEvents;
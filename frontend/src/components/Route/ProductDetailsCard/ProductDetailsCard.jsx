import React, { useEffect, useState } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { Link } from "react-router-dom";
import { backend_url } from "../../../server";
import styles from "../../../styles/styles";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addTocart } from "../../../redux/actions/cart";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";

const ProductDetailsCard = ({ setOpen, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(false);

  const handleMessageSubmit = () => {};

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  const incrementCount = () => {
    setCount(count + 1);
  };

  // Add to cart
  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      toast.error("item already in cart!");
    } else {
      if (data.stock < count) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: count };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart Successfully!");
      }
    }
  };

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist]);

  // Remove from wish list
  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  // add to wish list
  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  return (
    <>
      <div className="bg-[#fff]">
        {data ? (
          <div className="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
            <div className="w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll 800px:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
              <RxCross1
                size={30}
                className="absolute right-3 top-3 z-50"
                onClick={() => setOpen(false)}
              />

              <div className="block w-full 800px:flex">
                <div className="w-full 800px:w-[50%]">
                  <img
                    src={`${backend_url}${data.images && data.images[0]}`}
                    alt="img"
                  />
                  <div className="flex">
                    <Link
                      to={`/shop/preview/${data.shop._id}`}
                      className="flex"
                    >
                      <img
                        src={`${backend_url}${data?.shop?.avatar}`}
                        alt=""
                        className="w-[50px] h-[50px] rounded-full mr-2"
                      />
                      <div>
                        <h3 className={`${styles.shop_name}`}>
                          {data.shop.name}
                        </h3>
                        <h5 className="pb-3 text-[15px]">(4.5) Ratings</h5>
                      </div>
                    </Link>
                  </div>
                  <div
                    className={`${styles.button} bg-[#000] mt-4 rounded-[4px] h-11`}
                    onClick={handleMessageSubmit}
                  >
                    <span className="text-[#fff] flex items-center">
                      Send Message <AiOutlineMessage className="ml-1" />
                    </span>
                  </div>
                  <h5 className="text-[16px] text-[red] mt-5">
                    ({data?.sold_out}) Sold out
                  </h5>
                </div>
                {/* right */}
                <div className="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
                  <h1 className={`${styles.productTitle} text-[20px]`}>
                    {data.name}
                  </h1>
                  {data.description.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}

                  <div className="flex  pt-3 ">
                    <h4 className={`${styles.productDiscountPrice}`}>
                      {data.discountPrice.toLocaleString("vi-VN") + " VNĐ"}
                    </h4>
                    <h3 className={`${styles.price}`}>
                      {data.originalPrice
                        ? data.originalPrice.toLocaleString("vi-VN") + " VNĐ"
                        : null}
                    </h3>
                  </div>

                  <div className="flex items-center mt-12 justify-between pr-3">
                    <div className="flex items-center">
                      <button
                        className="h-10 bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l-md px-4 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
                        onClick={decrementCount}
                      >
                        -
                      </button>
                      <span className="h-10 bg-gray-200 text-gray-800 font-medium px-4 flex items-center justify-center border-y border-gray-300">
                        {count}
                      </span>
                      <button
                        className="h-10 bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-r-md px-4 shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
                        onClick={incrementCount}
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition-all duration-200">
                      {click ? (
                        <AiFillHeart
                          size={24}
                          className="cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-200"
                          onClick={() => removeFromWishlistHandler(data)}
                          color="red"
                          title="Remove from wishlist"
                        />
                      ) : (
                        <AiOutlineHeart
                          size={24}
                          className="cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-200"
                          onClick={() => addToWishlistHandler(data)}
                          color="#333"
                          title="Add to wishlist"
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className={`${styles.button} mt-6 rounded-[4px] h-11 flex items-center`}
                    onClick={() => addToCartHandler(data._id)}
                  >
                    <span className="text-[#fff] flex items-center">
                      Add to cart <AiOutlineShoppingCart className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ProductDetailsCard;

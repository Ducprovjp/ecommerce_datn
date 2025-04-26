import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
import {
  AiFillHeart,
  AiFillStar,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineStar,
} from "react-icons/ai";
import { backend_url } from "../../../server";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "../../Products/Ratings";

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist]);

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      toast.error("Item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart successfully!");
      }
    }
  };

  return (
    <div className="w-full h-[370px] bg-white rounded-lg shadow-sm p-3 relative cursor-pointer group hover:border hover:border-gray-200 transition-all duration-200">
      <div className="flex justify-end"></div>

      <Link
        to={`${
          isEvent === true
            ? `/product/${data._id}?isEvent=true`
            : `/product/${data._id}`
        }`}
      >
        <img
          src={data.images && data.images[0]}
          alt="prd"
          className="w-full h-[170px] object-contain"
        />
      </Link>
      <Link
        to={`${
          isEvent === true
            ? `/product/${data._id}?isEvent=true`
            : `/product/${data._id}`
        }`}
      >
        <h5 className={`${styles.shop_name} truncate`}>{data.shop.name}</h5>
      </Link>
      <Link to={`/product/${data._id}`}>
        <h4 className="pb-3 font-[500] truncate">
          {data.name.length > 40 ? data.name.slice(0, 40) + "..." : data.name}
        </h4>
        <div className="flex">
          <Ratings rating={data?.ratings} />
        </div>

        <div className="py-2 flex items-start justify-between">
          <div className="flex flex-col">
            <h5 className={`${styles.productDiscountPrice}`}>
              {data.originalPrice === 0
                ? data.originalPrice
                : data.discountPrice.toLocaleString("vi-VN") + " VNĐ"}
            </h5>
            <h4 className={`${styles.price}`}>
              {data.originalPrice
                ? data.originalPrice.toLocaleString("vi-VN") + " VNĐ"
                : null}
            </h4>
          </div>
          <span className="font-[400] text-[17px] text-[#68d284] text-right">
            {data?.sold_out} sold
          </span>
        </div>
      </Link>

      {/* side option */}
      <div className="absolute right-3 top-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {click ? (
          <AiFillHeart
            size={22}
            className="cursor-pointer"
            onClick={() => removeFromWishlistHandler(data)}
            color={click ? "red" : "#333"}
            title="Remove from wishlist"
          />
        ) : (
          <AiOutlineHeart
            size={22}
            className="cursor-pointer"
            onClick={() => addToWishlistHandler(data)}
            color={click ? "red" : "#333"}
            title="Add to wishlist"
          />
        )}
        <AiOutlineEye
          size={22}
          className="cursor-pointer"
          onClick={() => setOpen(!open)}
          color="#333"
          title="Quick view"
        />
        <AiOutlineShoppingCart
          size={25}
          className="cursor-pointer"
          onClick={() => addToCartHandler(data._id)}
          color="#444"
          title="Add to cart"
        />
      </div>
      {open ? <ProductDetailsCard setOpen={setOpen} data={data} /> : null}
    </div>
  );
};

export default ProductCard;

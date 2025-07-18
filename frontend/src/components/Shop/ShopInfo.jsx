import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllProductsShop } from "../../redux/actions/product";
import { logoutSeller } from "../../redux/actions/sellers";
import { getRequest } from "../../request/api";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";

const ShopInfo = ({ isOwner, onEditClick }) => {
  const [data, setData] = useState({});
  const { products } = useSelector((state) => state.products);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        dispatch(getAllProductsShop(id));
        setIsLoading(true);
        const res = await getRequest(`/shop/get-shop-info/${id}`);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch shop info");
        }
        setData(res.shop);
        setIsLoading(false);
      } catch (error) {
        console.error("Fetch shop info error:", error);
        toast.error(error.message || "Failed to fetch shop info");
        setIsLoading(false);
      }
    };
    fetchShopInfo();
  }, [dispatch, id]);

  const logoutHandler = async () => {
    try {
      await dispatch(logoutSeller());
      toast.success("Logged out successfully!");
      navigate("/shop-login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    }
  };

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const averageRating = (totalRatings / totalReviewsLength).toFixed(1) || 0;

  // Format address from addresses array
  const formattedAddress =
    data.addresses && data.addresses.length > 0
      ? `${data.addresses[0].address1}, ${data.addresses[0].ward}, ${data.addresses[0].district}, ${data.addresses[0].province}`
      : data.address || "No address provided";

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="w-full py-5">
            <div className="w-full flex items-center justify-center">
              <img
                src={data.avatar}
                alt="Shop avatar"
                className="w-[150px] h-[150px] object-cover rounded-full"
              />
            </div>
            <h3 className="text-center py-2 text-[20px]">{data.name}</h3>
            <p className="text-[16px] text-[#000000a6] p-[10px] flex items-center">
              {data.description || "No description provided"}
            </p>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Address</h5>
            <h4 className="text-[#000000a6]">{formattedAddress}</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Phone Number</h5>
            <h4 className="text-[#000000a6]">{data.phoneNumber || "No phone number provided"}</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Total Products</h5>
            <h4 className="text-[#000000a6]">{products && products.length}</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Shop Ratings</h5>
            <h4 className="text-[#000000b0]">{averageRating}/5</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">Joined On</h5>
            <h4 className="text-[#000000b0]">
              {data?.createdAt?.slice(0, 10) || "Unknown"}
            </h4>
          </div>
          {isOwner && (
            <div className="py-3 px-4">
              <div
                className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}
                onClick={onEditClick}
              >
                <span className="text-white">Edit Shop</span>
              </div>
              <div
                className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}
                onClick={logoutHandler}
              >
                <span className="text-white">Log Out</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShopInfo;
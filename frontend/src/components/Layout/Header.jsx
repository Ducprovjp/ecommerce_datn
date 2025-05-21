import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { categoriesData } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Configure,
  connectAutoComplete,
} from "react-instantsearch-dom";
import { debounce } from "lodash";

// Khởi tạo Algolia client
const searchClient = algoliasearch(
  process.env.REACT_APP_ALGOLIA_APP_ID || "PJS0OQNW89",
  process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY || "f297a27909246a533e36e3eb02b40dbc"
);

// Component hiển thị gợi ý từ khóa
const Autocomplete = ({ refine, hits, currentRefinement }) => {
  const navigate = useNavigate();

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && currentRefinement) {
      navigate(`/products?search=${encodeURIComponent(currentRefinement)}`);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={currentRefinement}
        onChange={(event) => refine(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tìm kiếm sản phẩm..."
        className="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
      />
      {currentRefinement && hits.length > 0 && (
        <div className="absolute bg-white z-10 shadow w-full left-0 p-3 rounded-lg max-h-[300px] overflow-y-auto">
          {hits.map((hit) => (
            <div
              key={hit.objectID}
              onClick={() => navigate(`/products?search=${encodeURIComponent(hit.query)}`)}
              className="py-2 hover:bg-slate-100 cursor-pointer rounded-md"
            >
              {hit.query}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomAutocomplete = connectAutoComplete(Autocomplete);

const Header = ({ activeHeading }) => {
  const { isSeller } = useSelector((state) => state.seller);
  const { isShipper } = useSelector((state) => state.shipper);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchRef = useRef(null);

  const debouncedSetSearchActive = debounce((value) => {
    setIsSearchActive(value.length > 0);
  }, 300);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70) {
        setActive(true);
      } else {
        setActive(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className={`${styles.section}`}>
        <div className="hidden 800px:h-[50px] 800px:my-[20px] 800px:flex items-center justify-between">
          <div className="relative w-40 h-20 rounded-2xl overflow-hidden">
            <Link to="/">
              <img
                className="w-full h-full object-cover rounded-2xl"
                src="https://blog.logrocket.com/wp-content/uploads/2023/03/How-NestJS-middleware-works.png"
                alt="Logo"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskSize: "cover",
                }}
              />
            </Link>
          </div>

          {/* Search box with Algolia */}
          <div className="w-[50%] relative" ref={searchRef}>
            <InstantSearch searchClient={searchClient} indexName="query_suggestions">
              <Configure hitsPerPage={5} />
              <CustomAutocomplete />
              {isSearchActive && (
                <div className="absolute min-h-[30vh] bg-slate-50 shadow-lg z-[9] p-4 rounded-lg w-full">
                  {/* Optional: Add product hits here if needed */}
                </div>
              )}
            </InstantSearch>
            <AiOutlineSearch
              size={30}
              className="absolute right-2 top-1.5 cursor-pointer"
            />
          </div>

          {/* Become a Shipper & Seller */}
          <div className="flex justify-center items-center">
            <div className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0 items-center">
              <div className={`${styles.button}`}>
                <Link to={`${isShipper ? "/shipper-dashboard" : "/shipper-create"}`}>
                  <h1 className="text-[#fff] flex items-center">
                    {isShipper ? "Go Dashboard" : "Become Shipper"}{" "}
                    <IoIosArrowForward className="ml-1" />
                  </h1>
                </Link>
              </div>
              <div className={`${styles.button}`}>
                <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                  <h1 className="text-[#fff] flex items-center">
                    {isSeller ? "Go Dashboard" : "Become Seller"}{" "}
                    <IoIosArrowForward className="ml-1" />
                  </h1>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2nd part of header */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        } transition hidden 800px:flex items-center justify-between w-full bg-[#3321c8] h-[70px]`}
      >
        <div className="w-full max-w-[1200px] mx-auto">
          <div className={`${styles.noramlFlex} justify-between`}>
            <div onClick={() => setDropDown(!dropDown)}>
              <div className="relative h-[60px] mt-[10px] w-[270px] hidden 1000px:block">
                <BiMenuAltLeft size={30} className="absolute top-3 left-2" />
                <button
                  className={`h-[100%] w-full flex justify-between items-center pl-10 bg-white font-sans text-lg font-[500] select-none rounded-t-md`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropDown(!dropDown);
                  }}
                >
                  All Categories
                </button>
                <IoIosArrowDown
                  size={20}
                  className="absolute right-2 top-4 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropDown(!dropDown);
                  }}
                />
                {dropDown ? (
                  <DropDown
                    categoriesData={categoriesData}
                    setDropDown={setDropDown}
                  />
                ) : null}
              </div>
            </div>
            <div className={`${styles.noramlFlex}`}>
              <Navbar active={activeHeading} />
            </div>
            <div className="flex">
              <div className={`${styles.noramlFlex}`}>
                <div
                  className="relative cursor-pointer mr-[15px]"
                  onClick={() => setOpenWishlist(true)}
                >
                  <AiOutlineHeart size={30} color="rgb(255 255 255 / 83%)" />
                  <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                    {wishlist && wishlist.length}
                  </span>
                </div>
              </div>
              <div className={`${styles.noramlFlex}`}>
                <div
                  className="relative cursor-pointer mr-[15px]"
                  onClick={() => setOpenCart(true)}
                >
                  <AiOutlineShoppingCart
                    size={30}
                    color="rgb(255 255 255 / 83%)"
                  />
                  <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                    {cart && cart.length}
                  </span>
                </div>
              </div>
              <div className={`${styles.noramlFlex}`}>
                <div className="relative cursor-pointer mr-[15px]">
                  {isAuthenticated ? (
                    <Link to="/profile">
                      <img
                        src={user.avatar}
                        className="w-[35px] h-[35px] rounded-full"
                        alt="Profile"
                      />
                    </Link>
                  ) : (
                    <Link to="/login">
                      <CgProfile size={30} color="rgb(255 255 255 / 83%)" />
                    </Link>
                  )}
                </div>
              </div>
              {openCart ? <Cart setOpenCart={setOpenCart} /> : null}
              {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        } w-full h-[60px] bg-[#fff] z-50 top-0 left-0 shadow-sm 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between max-w-[1200px] mx-auto">
          <div>
            <BiMenuAltLeft
              size={40}
              className="ml-4"
              onClick={() => setOpen(true)}
            />
          </div>
          <div>
            <Link to="/">
              <img
                src="https://shopo.quomodothemes.website/assets/images/logo.svg"
                alt="Logo"
                className="mt-3 cursor-pointer"
              />
            </Link>
          </div>
          <div>
            <div
              className="relative mr-[20px]"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart size={30} />
              <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                {cart && cart.length}
              </span>
            </div>
          </div>
          {openCart ? <Cart setOpenCart={setOpenCart} /> : null}
          {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {open ? (
        <div className={`fixed w-full bg-[#0000005f] z-20 h-full top-0 left-0`}>
          <div className="fixed w-[70%] bg-[#fff] h-screen top-0 left-0 z-10 overflow-y-scroll">
            <div className="w-full justify-between flex pr-3">
              <div>
                <div
                  className="relative mr-[15px]"
                  onClick={() => setOpenWishlist(true) || setOpen(false)}
                >
                  <AiOutlineHeart size={30} className="mt-5 ml-3" />
                  <span className="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
                    {wishlist && wishlist.length}
                  </span>
                </div>
              </div>
              <RxCross1
                size={30}
                className="ml-4 mt-5 cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Mobile Search Bar with Algolia */}
            <div className="my-8 w-[92%] m-auto h-[40px] relative">
              <InstantSearch searchClient={searchClient} indexName="query_suggestions">
                <Configure hitsPerPage={5} />
                <CustomAutocomplete />
                {isSearchActive && (
                  <div className="absolute bg-[#fff] z-10 shadow w-full left-0 p-3">
                    {/* Optional: Add product hits here if needed */}
                  </div>
                )}
              </InstantSearch>
            </div>

            <Navbar active={activeHeading} />
            <div className={`${styles.button} ml-4 !rounded-[4px]`}>
              <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                <h1 className="text-[#fff] flex items-center">
                  {isSeller ? "Go Dashboard" : "Become Seller"}{" "}
                  <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <div className={`${styles.button} ml-4 !rounded-[4px]`}>
              <Link to={`${isShipper ? "/shipper-dashboard" : "/shipper-create"}`}>
                <h1 className="text-[#fff] flex items-center">
                  {isShipper ? "Go Dashboard" : "Become Shipper"}{" "}
                  <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <br />
            <br />
            <br />
            <div className="flex w-full justify-center">
              {isAuthenticated ? (
                <div>
                  <Link to="/profile">
                    <img
                      src={user.avatar}
                      alt="Profile img"
                      className="w-[60px] h-[60px] rounded-full border-[3px] border-[#0eae88]"
                    />
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-[18px] pr-[10px] text-[#000000b7]"
                  >
                    Login{" "}
                  </Link>
                  <Link to="/sign-up" className="text-[18px] text-[#000000b7]">
                    Sign up{" "}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Header;
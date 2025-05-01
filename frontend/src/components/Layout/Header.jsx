import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import { productData, categoriesData } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { backend_url } from "../../server";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import { RxCross1 } from "react-icons/rx";

const Header = ({ activeHeading }) => {
  const { isSeller } = useSelector((state) => state.seller);
  const { isShipper } = useSelector((state) => state.shipper);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu

  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchRef = useRef(null);

  // Handle search change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter products
    const filteredProducts =
      allProducts &&
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );

    setSearchData(filteredProducts);

    // Set isSearchActive to true when there are search results
    setIsSearchActive(filteredProducts.length > 0);
  };

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

  window.addEventListener("scroll", () => {
    if (window.scrollY > 70) {
      setActive(true);
    } else {
      setActive(false);
    }
  });

  return (
    <>
      <div className={`${styles.section}`}>
        <div className="hidden 800px:h-[50px] 800px:my-[20px] 800px:flex items-center justify-between ">
          <div className="relative w-40 h-20 rounded-2xl overflow-hidden">
            <Link to="/">
              <img
                className="w-full h-full object-cover rounded-2xl"
                src="https://blog.logrocket.com/wp-content/uploads/2023/03/How-NestJS-middleware-works.png"
                alt=""
                style={{
                  WebkitMaskImage:
                    "radial-gradient(circle at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskSize: "cover",
                }}
              />
            </Link>
          </div>

          {/*Search box  */}
          <div className="w-[50%] relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Search for product..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
            />
            <AiOutlineSearch
              size={30}
              className="absolute right-2 top-1.5 cursor-pointer"
            />
            {isSearchActive && searchData && searchData.length !== 0 ? (
              <div className="absolute min-h-[30vh] bg-slate-50 shadow-lg z-[9] p-4 rounded-lg">
                {searchData.map((i, index) => {
                  return (
                    <Link
                      to={`/product/${i._id}`}
                      className="group w-full flex items-center py-3 hover:bg-slate-100 hover:border-[#3957db] hover:border-[1px] transition-all duration-300 ease-in-out rounded-lg"
                    >
                      <img
                        src={i.images[0]}
                        alt="img"
                        className="w-[40px] h-[40px] mr-[10px] transition-transform duration-300 ease-in-out"
                      />
                      <h1 className="text-sm group-hover:text-blue-600 font-medium transition-colors duration-300 ease-in-out">
                        {i.name}
                      </h1>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
          {/* Search end */}

          {/* Become a Shipper & Seller */}
          <div className="flex justify-center items-center">
            <div className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0 items-center">
              {/* Become a Shipper */}
              <div className={`${styles.button}`}>
                <Link to={`${isShipper ? "/dashboard" : "/shipper-create"}`}>
                  <h1 className="text-[#fff] flex items-center">
                    {isShipper ? "Go Dashboard" : "Become Shipper"}{" "}
                    <IoIosArrowForward className="ml-1" />
                  </h1>
                </Link>
              </div>

              {/* Become a Seller */}
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

      {/*  2nd part of header start */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        } transition hidden 800px:flex items-center justify-between w-full bg-[#3321c8] h-[70px]`}
      >
        <div className="w-full max-w-[1200px] mx-auto">
          <div className={`${styles.noramlFlex} justify-between`}>
            {/* Catagories */}
            <div onClick={() => setDropDown(!dropDown)}>
              <div className="relative h-[60px] mt-[10px] w-[270px] hidden 1000px:block">
                <BiMenuAltLeft size={30} className="absolute top-3 left-2" />
                <button
                  className={`h-[100%] w-full flex justify-between items-center pl-10 bg-white font-sans text-lg font-[500] select-none rounded-t-md`}
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
                    setDropDown(!dropDown);
                  }}
                >
                  All Categories
                </button>
                <IoIosArrowDown
                  size={20}
                  className="absolute right-2 top-4 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn chặn sự kiện lan ra ngoài
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

            {/* NavItems */}
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

              {/* avatar */}
              <div className={`${styles.noramlFlex}`}>
                <div className="relative cursor-pointer mr-[15px]">
                  {isAuthenticated ? (
                    <Link to="/profile">
                      <img
                        src={user.avatar}
                        className="w-[35px] h-[35px] rounded-full"
                        alt=""
                      />
                    </Link>
                  ) : (
                    <Link to="/login">
                      <CgProfile size={30} color="rgb(255 255 255 / 83%)" />
                    </Link>
                  )}
                </div>
              </div>
              {/* Avatar end */}
              {/* card  popup start */}
              {openCart ? <Cart setOpenCart={setOpenCart} /> : null}
              {/* card popup end */}

              {/* Wish list pop uo Start */}
              {openWishlist ? (
                <Wishlist setOpenWishlist={setOpenWishlist} />
              ) : null}
              {/* Wish list pop uo end */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className={`${
          active === true ? "shadow-sm fixed top-0 left-0 z-10" : null
        }
            w-full h-[60px] bg-[#fff] z-50 top-0 left-0 shadow-sm 800px:hidden`}
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
                alt=""
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
              <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px]  leading-tight text-center">
                {cart && cart.length}
              </span>
            </div>
          </div>
          {/* cart popup */}
          {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

          {/* wishlist popup */}
          {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
        </div>
      </div>

      {/*  side bar*/}
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
                  <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px]  leading-tight text-center">
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

            {/* Search Bar */}
            <div className="my-8 w-[92%] m-auto h-[40px relative]">
              <input
                type="search"
                placeholder="Search for products"
                className="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
                value={searchTerm}
                onChange={handleSearchChange}
              />

              {searchData && (
                <div className="absolute bg-[#fff] z-10 shadow w-full left-0 p-3">
                  {searchData.map((i, index) => {
                    const d = i.name;

                    const Product_name = d.replace(/\s+/g, "-");
                    return (
                      <Link to={`/product/${i._id}`}>
                        <div className="flex items-center">
                          <img
                            src={i.images[0]}
                            alt="img"
                            className="w-[50px] mr-2"
                          />
                          <h5>{i.name}</h5>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
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
              <Link to={`${isShipper ? "/dashboard" : "/shipper-create"}`}>
                <h1 className="text-[#fff] flex items-center">
                  {isShipper ? "Go Dashboard" : "Become Shipper"}{" "}
                  <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <br />
            <br />
            <br />

            {/* Mob Login */}
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

import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";

const DropDown = ({ categoriesData, setDropDown }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Hook để xử lý click ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropDown(false);
      }
    };

    // Thêm event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setDropDown]);

  const submitHandle = (i) => {
    navigate(`/products?category=${i.title}`);
    setDropDown(false);
    window.location.reload();
  };

  return (
    <div
      ref={dropdownRef}
      className="pb-4 w-[270px] bg-[#fff] absolute z-30 rounded-b-md shadow-sm"
    >
      {categoriesData &&
        categoriesData.map((i, index) => (
          <div
            key={index}
            className={`${styles.noramlFlex} relative overflow-hidden transition-all duration-300 hover:bg-gray-100 hover:pl-2 group cursor-pointer`}
            onClick={() => submitHandle(i)}
          >
            <img
              src={i.image_Url}
              className="w-[25px] h-[25px] object-contain ml-[10px] select-none transition-transform duration-300 group-hover:scale-110"
              alt="Drop Down img"
            />
            <h3 className="m-3 cursor-pointer select-none group-hover:text-blue-600">
              {i.title}
            </h3>
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
          </div>
        ))}
    </div>
  );
};

export default DropDown;

import React from "react";
import { Link } from "react-router-dom";
import { navItems } from "../../static/data";
import styles from "../../styles/styles";

const Navbar = ({ active }) => {
  return (
    <div className={`block 800px:${styles.noramlFlex}`}>
      {navItems.map((i, index) => (
        <div className="flex h-full" key={index}>
          <Link
            to={i.url}
            className={`relative w-full px-6 py-3 flex items-center justify-start 800px:justify-center font-[500] rounded-md cursor-pointer group transition-all duration-300 ease-in-out
    ${
      active === index + 1
        ? "text-[#17dd1f] bg-gray-100 800px:bg-transparent shadow-md scale-[1.02]"
        : "text-black 800px:text-white"
    }
    hover:bg-white hover:text-black hover:shadow-lg hover:scale-[1.03]`}
          >
            <span className="relative">
              {i.title}
              <span
                className={`absolute -bottom-1 left-0 h-[2px] bg-[#17dd1f] transition-all duration-500 ease-in-out 
        ${
          active === index + 1
            ? "w-full 800px:w-[60%] 800px:left-1/2 800px:-translate-x-1/2"
            : "w-0 group-hover:800px:w-[60%] group-hover:800px:left-1/2 group-hover:800px:-translate-x-1/2"
        }`}
              ></span>
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Navbar;

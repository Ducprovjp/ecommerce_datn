import React from "react";
import { useNavigate } from "react-router-dom";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const Categories = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={`${styles.section} hidden sm:block`}>
        <div
          className={`branding my-12 flex justify-between w-full shadow-sm bg-white p-5 rounded-md`}
        >
          {brandingData &&
            brandingData.map((i, index) => (
              <div className="flex items-start" key={index}>
                {i.icon}
                <div className="px-3">
                  <h3 className="font-bold text-sm md:text-base">{i.title}</h3>
                  <p className="text-xs md:text-sm">{i.Description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* categories */}
      <div
        className={`${styles.section} bg-white pt-4 px-4 pb-4 rounded-lg m-0`}
        id="categories"
      >
        <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-2 sm:gap-[10px] lg:grid-cols-4 lg:gap-[20px] xl:grid-cols-5 xl:gap-[30px]">
          {categoriesData &&
            categoriesData.map((i) => {
              const handleSubmit = (i) => {
                navigate(`/products?category=${i.title}`);
              };
              return (
                <div
                  className="w-full h-[150px] flex flex-col items-center justify-between cursor-pointer overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-md hover:scale-105 transition-all duration-200"
                  key={i.id}
                  onClick={() => handleSubmit(i)}
                >
                  <img
                    src={i.image_Url}
                    className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] object-cover"
                    alt="category"
                  />
                  <h5 className="text-[14px] sm:text-[18px] leading-[1.3] truncate font-semibold">
                    {i.title}
                  </h5>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Categories;

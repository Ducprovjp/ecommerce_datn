import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../../styles/styles";

const banners = [
  {
    image: "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    title: "Bộ Sưu Tập Tốt Nhất Cho <br /> Trang Trí Nhà Cửa",
    description:
      "Để tạo nên không gian sống lý tưởng, việc lựa chọn nội thất và phụ kiện trang trí đóng vai trò quan trọng. Từ ghế sofa thoải mái, bàn cà phê thanh lịch, đến giường ngủ ấm cúng, mỗi chi tiết đều góp phần tạo nên thiết kế hài hòa và ấn tượng.",
    isDark: false, // Nền sáng, chữ tối
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    title: "Nâng Tầm Không Gian Sống <br /> Với Thiết Kế Hiện Đại",
    description:
      "Khám phá các sản phẩm nội thất hiện đại với chất liệu cao cấp và thiết kế tinh tế. Tạo nên một ngôi nhà phản ánh phong cách cá nhân của bạn với sự kết hợp hoàn hảo giữa màu sắc và chất lượng.",
    isDark: true, // Nền sáng, chữ tối
  },
  {
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45",
    title: "Sự Kết Hợp Hoàn Hảo <br /> Cho Ngôi Nhà Của Bạn",
    description:
      "Biến ngôi nhà của bạn thành một tác phẩm nghệ thuật với các phụ kiện trang trí độc đáo, ánh sáng ấm áp và thảm mềm mại. Mỗi sản phẩm đều mang đến sự sang trọng và ấm cúng.",
    isDark: true, // Nền tối, chữ sáng
  },
];

const Hero = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } },
  };

  const textColor = banners[currentBanner].isDark ? "text-[#ffffff]" : "text-[#3d3a3a]";
  const descriptionColor = banners[currentBanner].isDark ? "text-[#ffffffba]" : "text-[#000000ba]";

  return (
    <div className={`relative min-h-[70vh] 800px:min-h-[80vh] w-full bg-no-repeat ${styles.noramlFlex}`}>
      <AnimatePresence>
        <motion.div
          key={currentBanner}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${banners[currentBanner].image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
      <div className={`${styles.section} w-full relative z-10`}>
        <AnimatePresence mode="wait">
          <motion.h1
            key={`title-${currentBanner}`}
            className={`text-[35px] leading-[1.2] 800px:text-[60px] font-[600] capitalize ${textColor}`}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            dangerouslySetInnerHTML={{ __html: banners[currentBanner].title }}
          />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={`desc-${currentBanner}`}
            className={`pt-5 text-[16px] font-[Poppins] font-[400] ${descriptionColor}`}
            variants={descriptionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {banners[currentBanner].description}
          </motion.p>
        </AnimatePresence>
        <Link to="/products" className="inline-block">
          <div className={`${styles.button} mt-5`}>
            <span className="text-[#fff] font-[Poppins] text-[18px]">Mua Ngay</span>
          </div>
        </Link>
      </div>
      {/* Nút điều hướng */}
      <button
        onClick={handlePrev}
        className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-[#ffffff] bg-opacity-50 hover:bg-opacity-75 text-[#000] font-[Poppins] text-[16px] w-10 h-10 rounded-full flex items-center justify-center transition-all"
      >
        ←
      </button>
      <button
        onClick={handleNext}
        className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-[#ffffff] bg-opacity-50 hover:bg-opacity-75 text-[#000] font-[Poppins] text-[16px] w-10 h-10 rounded-full flex items-center justify-center transition-all"
      >
        →
      </button>
    </div>
  );
};

export default Hero;
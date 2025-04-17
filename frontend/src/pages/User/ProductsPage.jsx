import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";
import Loader from "../../components/Layout/Loader";
import ProductCard from "../../components/Route/ProductCard/ProductCard";
import styles from "../../styles/styles";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryData = searchParams.get("category");
  const pageParam = searchParams.get("page");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    // Lấy trang từ URL nếu có
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [pageParam]);

  useEffect(() => {
    console.log("Category Selected:", categoryData);
    console.log("All Products:", allProducts);

    if (!allProducts || allProducts.length === 0) {
      setData([]);
      return;
    }

    let filteredData = [];
    if (categoryData === null) {
      filteredData = allProducts;
    } else {
      filteredData = allProducts.filter((i) =>
        i.category.toLowerCase().includes(categoryData.toLowerCase())
      );
    }
    console.log("Filtered Data:", filteredData);

    // Tính tổng số trang
    const total = Math.ceil(filteredData.length / productsPerPage);
    setTotalPages(total);

    // Lấy sản phẩm cho trang hiện tại
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setData(paginatedData);
  }, [allProducts, categoryData, currentPage]);

  // Xử lý khi chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    // Cập nhật URL với trang mới
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", pageNumber);
    setSearchParams(newParams);

    // Cuộn lên đầu trang
    window.scrollTo(0, 0);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={3} />
          <br />
          <br />
          <div className={`${styles.section}`}>
            <div className="grid grid-cols-2 gap-[10px] px-4 md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
              {data &&
                data.map((i, index) => <ProductCard data={i} key={index} />)}
            </div>
            {data && data.length === 0 ? (
              <h1 className="text-center w-full pb-[100px] text-[20px]">
                No products Found!
              </h1>
            ) : null}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-10 mb-10">
                <div className="flex space-x-2">
                  {/* Nút Previous */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Các nút số trang */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Nút Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ProductsPage;

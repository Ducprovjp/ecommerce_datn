import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";
import Loader from "../../components/Layout/Loader";
import ProductCard from "../../components/Route/ProductCard/ProductCard";
import styles from "../../styles/styles";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const pageParam = searchParams.get("page");
  const { isLoading } = useSelector((state) => state.products);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;
  const [filters, setFilters] = useState({
    category: categoryData || "",
    minPrice: "",
    maxPrice: "",
  });
  const [tempFilters, setTempFilters] = useState({
    category: categoryData || "",
    minPrice: "",
    maxPrice: "",
  });
  const [sortOption, setSortOption] = useState("");
  const [tempSortOption, setTempSortOption] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    // Lấy trang từ URL nếu có
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [pageParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {
          page: currentPage,
          limit: productsPerPage,
        };
        if (filters.category) params.category = filters.category;
        if (filters.minPrice !== "" && !isNaN(filters.minPrice)) {
          params.minPrice = parseFloat(filters.minPrice);
        }
        if (filters.maxPrice !== "" && !isNaN(filters.maxPrice)) {
          params.maxPrice = parseFloat(filters.maxPrice);
        }
        if (sortOption) params.sort = sortOption;

        const response = await axios.get(`${process.env.REACT_APP_SERVER}/product/get-all-products`, {
          params,
          withCredentials: true,
        });
        setData(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
        setData([]);
        setTotalPages(1);
      }
    };

    fetchProducts();
  }, [filters, sortOption, currentPage]);

  // Xử lý khi chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", pageNumber);
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  // Xử lý thay đổi bộ lọc tạm thời
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi sắp xếp tạm thời
  const handleSortChange = (e) => {
    setTempSortOption(e.target.value);
  };

  // Áp dụng bộ lọc và sắp xếp
  const applyFiltersAndSort = () => {
    if (
      tempFilters.minPrice !== "" &&
      tempFilters.maxPrice !== "" &&
      parseFloat(tempFilters.minPrice) > parseFloat(tempFilters.maxPrice)
    ) {
      alert("Giá tối thiểu không thể lớn hơn giá tối đa!");
      return;
    }
    if (
      (tempFilters.minPrice !== "" && parseFloat(tempFilters.minPrice) < 0) ||
      (tempFilters.maxPrice !== "" && parseFloat(tempFilters.maxPrice) < 0)
    ) {
      alert("Giá không thể âm!");
      return;
    }
    setFilters({ ...tempFilters });
    setSortOption(tempSortOption);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", 1);
    if (tempFilters.category) newParams.set("category", tempFilters.category);
    else newParams.delete("category");
    setSearchParams(newParams);
  };

  // Lấy danh sách danh mục duy nhất từ API
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/product/get-all-products`, {
          withCredentials: true,
        });
        const uniqueCategories = [
          ...new Set(response.data.products.map((p) => p.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Xử lý thay đổi chế độ xem
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
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
            {/* Bộ lọc và sắp xếp */}
            <div className="mb-6 px-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Bộ lọc */}
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    name="category"
                    value={tempFilters.category}
                    onChange={handleFilterChange}
                    className="border p-2 rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="minPrice"
                    value={tempFilters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min Price"
                    className="border p-2 rounded-md"
                    min="0"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={tempFilters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max Price"
                    className="border p-2 rounded-md"
                    min="0"
                  />
                </div>

                {/* Sắp xếp */}
                <div className="flex items-center gap-4">
                  <select
                    value={tempSortOption}
                    onChange={handleSortChange}
                    className="border p-2 rounded-md"
                  >
                    <option value="">Sort by</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                  <button
                    onClick={applyFiltersAndSort}
                    className={`${styles.button} !bg-blue-500 text-white rounded-md `}
                  >
                    Apply
                  </button>
                </div>

                {/* Chuyển đổi chế độ xem */}
                <button
                  onClick={toggleViewMode}
                  className={`${styles.button} !bg-blue-500 text-white rounded-md `}
                >
                  {viewMode === "grid" ? "List Mode" : "Grid Mode"}
                </button>
              </div>
            </div>

            {/* Hiển thị sản phẩm */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-[10px] px-4 md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12"
                  : "flex flex-col gap-4 px-4 mb-12"
              }
            >
              {data &&
                data.map((i, index) => (
                  <ProductCard data={i} key={index} viewMode={viewMode} />
                ))}
            </div>
            {data && data.length === 0 ? (
              <h1 className="text-center w-full pb-[100px] text-[20px]">
                No products found!
              </h1>
            ) : null}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-10 mb-10">
                <div className="flex space-x-2">
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

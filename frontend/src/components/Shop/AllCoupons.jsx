import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { useSelector } from "react-redux";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import { getRequest, postRequest, deleteRequest } from "../../request/api";

const AllCoupons = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [minAmount, setMinAmount] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [value, setValue] = useState(null);
  const [discountType, setDiscountType] = useState("percentage");
  const [applyTo, setApplyTo] = useState("product");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState(0);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    setIsLoading(true);
    getRequest(`/coupon/get-coupon/${seller._id}`)
      .then((res) => {
        console.log("Fetched coupons:", res);
        if (!res.success) {
          throw new Error(res.message || "Failed to fetch coupons");
        }
        setCoupons(res.couponCodes);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Fetch coupons error:", error);
        toast.error(error.message || "Failed to fetch coupons");
        setIsLoading(false);
      });
  }, [seller._id]);

  const handleDelete = async (id) => {
    try {
      const res = await deleteRequest(`/coupon/delete-coupon/${id}`);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete coupon");
      }
      toast.success("Xóa mã giảm giá thành công!");
      window.location.reload();
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(endDate) < new Date()) {
      toast.error("Ngày hết hạn phải sau ngày hiện tại!");
      return;
    }
    try {
      const couponData = {
        name,
        minAmount,
        maxAmount,
        selectedProduct: selectedProducts.length > 0 ? selectedProducts : [],
        value,
        discountType,
        applyTo,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        usageLimit,
        shopId: seller._id,
      };
      console.log("Creating coupon:", couponData);
      const res = await postRequest("/coupon/create-coupon-code", couponData);
      if (!res.success) {
        throw new Error(res.message || "Failed to create coupon");
      }
      toast.success("Tạo mã giảm giá thành công!");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Create coupon error:", error);
      toast.error(error.message || "Failed to create coupon");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Mã giảm giá", minWidth: 180, flex: 1.4 },
    { field: "discountType", headerName: "Loại", minWidth: 100, flex: 0.6 },
    {
      field: "value",
      headerName: "Giá trị",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) =>
        params.row.discountType === "percentage"
          ? `${params.value}%`
          : `${params.value.toLocaleString("vi-VN")} VNĐ`,
    },
    {
      field: "applyTo",
      headerName: "Áp dụng cho",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) =>
        params.value === "product" ? "Sản phẩm" : "Phí ship",
    },
    {
      field: "endDate",
      headerName: "Hết hạn",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "usageLimit",
      headerName: "Giới hạn sử dụng",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => params.value || "Không giới hạn",
    },
    {
      field: "usedCount",
      headerName: "Số lần đã dùng",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Button onClick={() => handleDelete(params.id)}>
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const rows = coupons.map((item) => ({
    id: item._id,
    name: item.name,
    discountType: item.discountType || "percentage",
    value: item.value,
    applyTo: item.applyTo,
    endDate: item.endDate,
    usageLimit: item.usageLimit,
    usedCount: item.usedCount,
  }));

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <div className="w-full flex justify-end">
            <div
              className={`${styles.button} !w-max !h-[45px] px-3 !rounded-[5px] mr-3 mb-3`}
              onClick={() => setOpen(true)}
            >
              <span className="text-white">Tạo mã giảm giá</span>
            </div>
          </div>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
          {open && (
            <div className="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[20000] flex items-center justify-center">
              <div className="w-[90%] 800px:w-[40%] h-[80vh] bg-white rounded-md shadow p-4 overflow-y-auto">
                <div className="w-full flex justify-end">
                  <RxCross1
                    size={30}
                    className="cursor-pointer"
                    onClick={() => setOpen(false)}
                  />
                </div>
                <h5 className="text-[30px] font-Poppins text-center">
                  Tạo mã giảm giá
                </h5>
                <form onSubmit={handleSubmit} aria-required={true}>
                  <div>
                    <label className="pb-2">
                      Mã giảm giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={name}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập mã giảm giá..."
                    />
                  </div>

                  <div>
                    <label className="pb-2">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full mt-2 border h-[35px] rounded-[5px]"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      required
                    >
                      <option value="percentage">Phần trăm</option>
                      <option value="fixed">Số tiền cố định</option>
                    </select>
                  </div>

                  <div>
                    <label className="pb-2">
                      Áp dụng cho <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full mt-2 border h-[35px] rounded-[5px]"
                      value={applyTo}
                      onChange={(e) => setApplyTo(e.target.value)}
                      required
                    >
                      <option value="product">Sản phẩm</option>
                      <option value="shipping">Phí ship</option>
                    </select>
                  </div>

                  <div>
                    <label className="pb-2">
                      Giá trị giảm giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={value}
                      required
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={
                        discountType === "percentage"
                          ? "Nhập phần trăm giảm giá..."
                          : "Nhập số tiền giảm (VNĐ)..."
                      }
                    />
                  </div>

                  <div>
                    <label className="pb-2">Số tiền tối thiểu</label>
                    <input
                      type="number"
                      name="minAmount"
                      value={minAmount}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="Nhập số tiền tối thiểu..."
                    />
                  </div>

                  <div>
                    <label className="pb-2">Số tiền tối đa</label>
                    <input
                      type="number"
                      name="maxAmount"
                      value={maxAmount}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="Nhập số tiền tối đa..."
                    />
                  </div>

                  <div>
                    <label className="pb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={startDate}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="pb-2">
                      Ngày hết hạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={endDate}
                      required
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="pb-2">Giới hạn sử dụng</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={usageLimit}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setUsageLimit(e.target.value)}
                      placeholder="Nhập giới hạn sử dụng (0 cho không giới hạn)..."
                    />
                  </div>

                  <div>
                    <label className="pb-2">Sản phẩm áp dụng</label>
                    <select
                      multiple
                      className="w-full mt-2 border h-[100px] rounded-[5px]"
                      value={selectedProducts}
                      onChange={(e) =>
                        setSelectedProducts(
                          Array.from(e.target.selectedOptions, (option) => option.value)
                        )
                      }
                    >
                      <option value="">Tất cả sản phẩm</option>
                      {products && products.length > 0 ? (
                        products.map((product) => (
                          <option value={product.name} key={product._id}>
                            {product.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Không có sản phẩm</option>
                      )}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều sản phẩm.
                      Để trống để áp dụng cho tất cả sản phẩm.
                    </p>
                  </div>

                  <div>
                    <input
                      type="submit"
                      value="Tạo"
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AllCoupons;
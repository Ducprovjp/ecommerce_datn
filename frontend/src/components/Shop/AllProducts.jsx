import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, deleteProduct, getAllProductsShop, updateProduct } from "../../redux/actions/product";
import { uploadFileRequest } from "../../request/api";
import { categoriesData } from "../../static/data";
import Loader from "../Layout/Loader";

const AllProducts = () => {
  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    imageUrls: [],
  });

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller._id]);

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    window.location.reload();
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      tags: product.tags,
      originalPrice: product.originalPrice,
      discountPrice: product.discountPrice,
      stock: product.stock,
      imageUrls: product.images || [],
    });
    setOpen(true);
  };

  const handleUpdate = () => {
    const updateFormData = new FormData();
    updateFormData.append("name", formData.name);
    updateFormData.append("description", formData.description);
    updateFormData.append("category", formData.category);
    if (formData.originalPrice) {
      updateFormData.append("originalPrice", formData.originalPrice);
    }
    if (formData.tags) {
      updateFormData.append("tags", formData.tags);
    }
    updateFormData.append("discountPrice", formData.discountPrice);
    updateFormData.append("stock", formData.stock);
    updateFormData.append("oldImages", JSON.stringify(formData.imageUrls));

    dispatch(updateProduct(selectedProduct._id, updateFormData));
    setOpen(false);
    window.location.reload();
  };

  const handleRemoveImage = (index) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls.splice(index, 1);
    setFormData({ ...formData, imageUrls: newImageUrls });
  };

  const uploadImageToServer = async (files) => {
    const uploadFormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadFormData.append("images", files[i]);
    }

    try {
      const res = await uploadFileRequest("/product/upload-image", uploadFormData);
      if (res.success) {
        return res.imageUrls;
      } else {
        alert("Failed to upload images: " + res.message);
        return [];
      }
    } catch (error) {
      alert("Error uploading images: " + error.message);
      return [];
    }
  };

  const handleAddImage = async (e) => {
    const files = Array.from(e.target.files);
    if (files && files.length > 0) {
      const imageUrls = await uploadImageToServer(files);
      if (imageUrls.length > 0) {
        setFormData({
          ...formData,
          imageUrls: [...formData.imageUrls, ...imageUrls],
        });
      }
    }
  };

  const handleCreateProduct = async () => {
    if (!formData.imageUrls || formData.imageUrls.length === 0) {
      alert("Please upload at least one image!");
      return;
    }

    const createFormData = new FormData();
    createFormData.append("name", formData.name);
    createFormData.append("description", formData.description);
    createFormData.append("category", formData.category);
    if (formData.originalPrice) {
      createFormData.append("originalPrice", formData.originalPrice);
    }
    if (formData.tags) {
      createFormData.append("tags", formData.tags);
    }
    createFormData.append("discountPrice", formData.discountPrice);
    createFormData.append("stock", formData.stock);
    createFormData.append("shopId", seller._id);
    formData.imageUrls.forEach((url, index) => {
      createFormData.append(`imageUrls[${index}]`, url);
    });

    dispatch(createProduct(createFormData));
    setFormData({
      name: "",
      description: "",
      category: "",
      tags: "",
      originalPrice: "",
      discountPrice: "",
      stock: "",
      imageUrls: [],
    });
    setOpen(false);
    window.location.reload();
  };

  // Sắp xếp sản phẩm theo createdAt giảm dần
  const sortedProducts = products
    ? [...products].sort((a, b) => new Date(b.createdAt.$date) - new Date(a.createdAt.$date))
    : [];

  console.log("Sorted Products:", sortedProducts);

  return (
    <div className="w-full p-8">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">All Products</h2>
          {/* <button
            onClick={() => {
              setSelectedProduct(null);
              setFormData({
                name: "",
                description: "",
                category: "",
                tags: "",
                originalPrice: "",
                discountPrice: "",
                stock: "",
                imageUrls: [],
              });
              setOpen(true);
            }}
            className="bg-[#f63b60] text-white px-4 py-2 rounded-md hover:bg-[#e12c4f] mb-6"
          >
            Create Product
          </button> */}
          {sortedProducts.length === 0 ? (
            <p className="text-gray-600">No products found.</p>
          ) : (
            sortedProducts.map((product) => (
              <div
                key={product._id}
                className="w-full bg-white rounded-md shadow-md p-6 mb-4"
              >
                <div className="flex flex-col">
                  {/* Hiển thị sản phẩm */}
                  <div className="flex items-center mb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{product.name}</h4>
                      <p className="text-xs text-gray-600">
                        Price: {product.discountPrice.toLocaleString("vi-VN")} VNĐ
                      </p>
                      <p className="text-xs text-gray-600">
                        Stock: {product.stock}
                      </p>
                      <p className="text-xs text-gray-600">
                        Sold: {product.sold_out}
                      </p>
                    </div>
                  </div>
                  {/* Nút hành động */}
                  <div className="flex justify-end space-x-2">
                    <a
                      href={`/product/${product._id}`}
                      className="flex items-center bg-[#f63b60] text-white px-4 py-2 rounded-md hover:bg-[#e12c4f]"
                    >
                      Preview
                      <AiOutlineEye className="ml-2" size={20} />
                    </a>
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Edit
                      <AiOutlineEdit className="ml-2" size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Delete
                      <AiOutlineDelete className="ml-2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Modal create/update */}
          {open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">
                  {selectedProduct ? "Update Product" : "Create Product"}
                </h2>
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        rows="3"
                        placeholder="Enter product description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Category</option>
                        {categoriesData.map((i) => (
                          <option value={i.title} key={i.title}>
                            {i.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter product tags"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Original Price
                      </label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter original price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Price
                      </label>
                      <input
                        type="number"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter discount price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter stock quantity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {formData.imageUrls.map((imgUrl, index) => (
                          <div key={index} className="relative w-24 h-24">
                            <img
                              src={imgUrl}
                              alt={`product-${index}`}
                              className="w-full h-full object-cover rounded border"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <label className="relative w-24 h-24 border border-dashed border-gray-400 flex items-center justify-center cursor-pointer rounded">
                          <span className="text-2xl text-gray-500">+</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAddImage}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white pt-4 border-t">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 border rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={selectedProduct ? handleUpdate : handleCreateProduct}
                      className="px-4 py-2 bg-[#f63b60] text-white rounded-md hover:bg-[#e12c4f]"
                    >
                      {selectedProduct ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllProducts;
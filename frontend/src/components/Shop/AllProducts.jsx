// AllProducts.jsx
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  getAllProductsShop,
  updateProduct,
} from "../../redux/actions/product";
import Loader from "../Layout/Loader";
import axios from "axios";
import { categoriesData } from "../../static/data";

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
    images: [],
  });

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);

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
      images: product.images || [],
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
    updateFormData.append("oldImages", JSON.stringify(formData.images));

    dispatch(updateProduct(selectedProduct._id, updateFormData));
    setOpen(false);
    window.location.reload();
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const uploadImageToServer = async (files) => {
    const uploadFormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadFormData.append("images", files[i]);
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER}/product/upload-image`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setFormData({
          ...formData,
          images: [...formData.images, ...res.data.imageUrls],
        });
      } else {
        alert("Failed to upload images");
      }
    } catch (error) {
      alert("Error uploading images: " + error.message);
    }
  };

  const handleAddImage = (e) => {
    const files = e.target.files; // Lấy tất cả file được chọn
    if (files && files.length > 0) {
      uploadImageToServer(files); // Truyền danh sách file
    }
  };

  const columns = [
    { field: "id", headerName: "Product Id", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Name", minWidth: 220, flex: 1.5 },
    { field: "price", headerName: "Price", minWidth: 100, flex: 0.6 },
    {
      field: "Stock",
      headerName: "Stock",
      type: "number",
      minWidth: 80,
      flex: 0.5,
    },
    {
      field: "sold",
      headerName: "Sold out",
      type: "number",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: "Preview",
      flex: 0.5,
      minWidth: 80,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/product/${params.id}`}>
          <Button>
            <AiOutlineEye size={20} />
          </Button>
        </Link>
      ),
    },
    {
      field: "Edit",
      flex: 0.5,
      minWidth: 80,
      headerName: "",
      sortable: false,
      renderCell: (params) => {
        const product = products.find((item) => item._id === params.id);
        return (
          <Button onClick={() => handleEdit(product)}>
            <AiOutlineEdit size={20} />
          </Button>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.5,
      minWidth: 80,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Button onClick={() => handleDelete(params.id)}>
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const rows =
    products?.map((item) => ({
      id: item._id,
      name: item.name,
      price: item.discountPrice.toLocaleString("vi-VN") + " VNĐ",
      Stock: item.stock,
      sold: item.sold_out,
    })) || [];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />

          {/* Modal update */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Update Product</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Description"
                margin="normal"
                multiline
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {categoriesData &&
                    categoriesData.map((i) => (
                      <MenuItem value={i.title} key={i.title}>
                        {i.title}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Tags"
                margin="normal"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Original Price"
                type="number"
                margin="normal"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Price (With Discount)"
                type="number"
                margin="normal"
                value={formData.discountPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountPrice: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Product Stock"
                type="number"
                margin="normal"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />

              <Typography variant="subtitle1" style={{ marginTop: "16px" }}>
                Current Images:
              </Typography>
              <div className="flex flex-wrap gap-3 mt-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={img}
                      alt={`product-${index}`}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      style={{ transform: "translate(50%, -50%)" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {/* Nút thêm ảnh mới */}
                <label className="relative w-24 h-24 border border-dashed border-gray-400 flex items-center justify-center cursor-pointer rounded">
                  <span className="text-2xl text-gray-500">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple // Thêm thuộc tính multiple
                    onChange={handleAddImage}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                color="primary"
                variant="contained"
              >
                Update
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default AllProducts;

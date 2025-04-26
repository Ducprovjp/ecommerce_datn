import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShipper } from "../../redux/actions/order";
import { AiOutlineArrowRight } from "react-icons/ai";

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { shipper } = useSelector((state) => state.shipper);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfShipper(shipper._id));
  }, [dispatch]);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.5 },
    {
      field: "itemsName",
      headerName: "Name",
      type: "text",
      minWidth: 200,
      flex: 1.0,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => {
        const greenStatuses = ["Delivered", "Refund Success"];
        return (
          <span
            className={`font-bold ${
              greenStatuses.includes(params.value)
                ? "text-green-600"
                : "text-yellow-500"
            }`}
          >
            {params.value}
          </span>
        );
      },
    },

    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 80,
      flex: 0.4,
    },

    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 120,
      flex: 0.6,
    },

    {
      field: " ",
      flex: 0.3,
      minWidth: 80,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/shipper/order/${params.id}`}>
              <Button>
                <AiOutlineArrowRight size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },
  ];

  const row = [];

  orders &&
    orders.forEach((item) => {
      row.push({
        id: item._id,
        itemsName: item.cart.map((i) => i.name),
        itemsQty: item.cart.length,
        total: item.totalPrice.toLocaleString("vi-VN") + " VNĐ",
        status: item.status,
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </>
  );
};

export default AllOrders;

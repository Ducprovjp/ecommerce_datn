import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { MdBorderClear } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShipper } from "../../redux/actions/order";
import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";

const ShipperDashboardHero = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { shipper } = useSelector((state) => state.shipper);

  useEffect(() => {
    dispatch(getAllOrdersOfShipper(shipper._id));
  }, [dispatch]);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.5 },
    {
      field: "itemsName",
      headerName: "Items name",
      type: "text",
      minWidth: 200,
      flex: 1.0,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.5,
      cellClassName: (params) => {
        return params.getValue(params.id, "status") === "Delivered"
          ? "greenColor"
          : "redColor";
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
        itemsQty: item.cart.reduce((acc, item) => acc + item.qty, 0),
        total: item.totalPrice.toLocaleString("vi-VN") + " VNĐ",
        status: item.status,
      });
    });

  return (
    <div className="w-full p-8">
      <h3 className="text-[22px] font-Poppins pb-2">Shipper Dashboard</h3>
      <div className="w-full block 800px:flex items-center justify-between">
        <div className="w-full mb-4 800px:w-[45%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
          <div className="flex items-center">
            <MdBorderClear size={30} className="mr-2" fill="#00000085" />
            <h3
              className={`${styles.productTitle} !text-[18px] text-[#00000085]`}
            >
              All Orders
            </h3>
          </div>
          <h5 className="pt-2 pl-[36px] text-[22px] font-[500]">
            {orders && orders.length}
          </h5>
          <Link to="/shipper-orders">
            <h5 className="pt-4 pl-2 text-[#077f9c]">View Orders</h5>
          </Link>
        </div>
      </div>
      <br />
      <h3 className="text-[22px] font-Poppins pb-2">Latest Orders</h3>
      <div className="w-full min-h-[45vh] bg-white rounded">
        <DataGrid
          rows={row}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
        />
      </div>
    </div>
  );
};

export default ShipperDashboardHero;

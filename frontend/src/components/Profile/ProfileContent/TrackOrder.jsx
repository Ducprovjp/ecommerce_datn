// src/components/ProfileContent/TrackOrder.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "../../../redux/actions/order";
import { DataGrid } from "@material-ui/data-grid";
import { MdTrackChanges } from "react-icons/md";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

const TrackOrder = () => {
  const { user } = useSelector((state) => state.user);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user._id]);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },
    { field: "itemsName", headerName: "Product Name", type: "text", minWidth: 200, flex: 1.0 },
    {
      field: "status",
      headerName: "Order Status",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <span
          className={`font-bold ${
            ["Delivered", "Refund Success"].includes(params.value)
              ? "text-green-600"
              : "text-yellow-500"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    { field: "itemsQty", headerName: "Quantity", type: "number", minWidth: 130, flex: 0.7 },
    { field: "total", headerName: "Total amount", type: "number", minWidth: 130, flex: 0.8 },
    {
      field: " ",
      flex: 1,
      minWidth: 150,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/user/track/order/${params.id}`}>
          <Button>
            <MdTrackChanges size={20} />
          </Button>
        </Link>
      ),
    },
  ];

  const row = orders?.map((item) => ({
    id: item._id,
    itemsName: item.cart.map((i) => i.name).join(", "),
    itemsQty: item.cart.length,
    total: +item.totalPrice,
    status: item.status,
  })) || [];

  return (
    <div className="pl-8 pt-1">
      <DataGrid
        rows={row}
        columns={columns}
        pageSize={10}
        disableSelectionOnClick
        autoHeight
      />
    </div>
  );
};

export default TrackOrder;
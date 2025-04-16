import axios from "axios";
import { server } from "../../server";

// get all shippers --- admin
export const getAllShippers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllShippersRequest",
    });

    const { data } = await axios.get(`${server}/shipper/admin-all-shippers`, {
      withCredentials: true,
    });

    dispatch({
      type: "getAllShippersSuccess",
      payload: data.shippers,
    });
  } catch (error) {
    dispatch({
      type: "getAllShippersFailed",
      //   payload: error.response.data.message,
    });
  }
};

// update delivered area
export const updateShipperDeliveredArea =
  (province, district, ward) => async (dispatch) => {
    try {
      dispatch({
        type: "updateShipperDeliveredAreaRequest",
      });

      const { data } = await axios.post(
        `${server}/shipper/update-shipper-delivered-area`,
        {
          province,
          district,
          ward,
        },
        { withCredentials: true }
      );

      dispatch({
        type: "updateShipperDeliveredAreaSuccess",
        payload: {
          successMessage: "Shipper delivered area updated succesfully!",
          shipper: data.shipper,
        },
      });
    } catch (error) {
      dispatch({
        type: "updateShipperDeliveredAreaFailed",
        payload: error.response.data.message,
      });
    }
  };

// delete delivered area
export const deleteShipperDeliveredArea = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteShipperDeliveredAreaRequest",
    });

    const { data } = await axios.delete(
      `${server}/shipper/delete-shipper-delivered-area/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteShipperDeliveredAreaSuccess",
      payload: {
        successMessage: "Delivered area deleted successfully!",
        shipper: data.shipper,
      },
    });
  } catch (error) {
    dispatch({
      type: "deleteShipperDeliveredAreaFailed",
      payload: error.response.data.message,
    });
  }
};

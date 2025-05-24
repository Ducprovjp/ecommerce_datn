import { getRequest, postRequest, deleteRequest } from "../../request/api";

// create event
export const createevent = (newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "eventCreateRequest",
    });

    const res = await postRequest("/event/create-event", newForm);
    if (!res.success) {
      throw new Error(res.message || "Failed to create event");
    }
    dispatch({
      type: "eventCreateSuccess",
      payload: res.event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    dispatch({
      type: "eventCreateFail",
      payload: error.message || "Failed to create event",
    });
  }
};

// get all events of a shop
export const getAllEventsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsShopRequest",
    });

    const res = await getRequest(`/event/get-all-events/${id}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch shop events");
    }
    dispatch({
      type: "getAlleventsShopSuccess",
      payload: res.events,
    });
  } catch (error) {
    console.error("Fetch shop events error:", error);
    dispatch({
      type: "getAlleventsShopFailed",
      payload: error.message || "Failed to fetch shop events",
    });
  }
};

// delete event of a shop
export const deleteEvent = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteeventRequest",
    });

    const res = await deleteRequest(`/event/delete-shop-event/${id}`);
    if (!res.success) {
      throw new Error(res.message || "Failed to delete event");
    }
    dispatch({
      type: "deleteeventSuccess",
      payload: res.message,
    });
  } catch (error) {
    console.error("Delete event error:", error);
    dispatch({
      type: "deleteeventFailed",
      payload: error.message || "Failed to delete event",
    });
  }
};

// get all events
export const getAllEvents = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAlleventsRequest",
    });

    const res = await getRequest("/event/get-all-events");
    if (!res.success) {
      throw new Error(res.message || "Failed to fetch all events");
    }
    dispatch({
      type: "getAlleventsSuccess",
      payload: res.events,
    });
  } catch (error) {
    console.error("Fetch all events error:", error);
    dispatch({
      type: "getAlleventsFailed",
      payload: error.message || "Failed to fetch all events",
    });
  }
};
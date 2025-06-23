import axios from "axios";

// Định nghĩa kiểu dữ liệu response
export const ResponseDataType = {
  code: Number,
  message: String | Array,
  data: Object,
};

// Hàm lấy key token và endpoint dựa trên role
const getTokenKeysAndEndpoints = () => {
  const role = localStorage.getItem("role") || "user";
  switch (role) {
    case "seller":
      return {
        accessTokenKey: "seller_accessToken",
        refreshTokenKey: "seller_refreshToken",
        refreshEndpoint: "/shop/refresh-token",
        logoutEndpoint: "/shop/logout",
        loginRedirect: "/shop-login",
      };
    case "shipper":
      return {
        accessTokenKey: "shipper_accessToken",
        refreshTokenKey: "shipper_refreshToken",
        refreshEndpoint: "/shipper/refresh-token",
        logoutEndpoint: "/shipper/logout",
        loginRedirect: "/shipper-login",
      };
    default:
      return {
        accessTokenKey: "accessToken",
        refreshTokenKey: "refreshToken",
        refreshEndpoint: "/user/refresh-token",
        logoutEndpoint: "/user/logout",
        loginRedirect: "/login",
      };
  }
};

// Tạo hàm generateRequestHeader
export function generateRequestHeader() {
  const { accessTokenKey } = getTokenKeysAndEndpoints();
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem(accessTokenKey) || ""}`,
    },
  };
}

// Hàm làm mới token
export async function refreshToken() {
  try {
    const { refreshTokenKey, refreshEndpoint } = getTokenKeysAndEndpoints();
    const refreshToken = localStorage.getItem(refreshTokenKey);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${process.env.REACT_APP_SERVER}${refreshEndpoint}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    const { accessTokenKey, refreshTokenKey: newRefreshTokenKey } = getTokenKeysAndEndpoints();
    localStorage.setItem(accessTokenKey, response.data.accessToken);
    localStorage.setItem(newRefreshTokenKey, response.data.refreshToken);
    return false; // Làm mới thành công
  } catch (error) {
    console.error("Refresh token error:", error);
    const { accessTokenKey, refreshTokenKey, loginRedirect } = getTokenKeysAndEndpoints();
    localStorage.removeItem(accessTokenKey);
    localStorage.removeItem(refreshTokenKey);
    localStorage.removeItem("role");
    window.location.href = loginRedirect;
    return true; // Làm mới thất bại
  }
}

// Hàm upload file
export async function uploadFileRequest(url, formData) {
  try {
    const { accessTokenKey } = getTokenKeysAndEndpoints();
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER}${url}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem(accessTokenKey) || ""}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      if (await refreshToken()) return;
      return await uploadFileRequest(url, formData);
    }
    if (error?.response?.status === 413) {
      return { code: -99, message: "File size exceeds 20MB" };
    }
    return error?.response?.data || { code: -1, message: "Request failed" };
  }
}

// Hàm POST request
export async function postRequest(url, body) {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER}${url}`,
      body,
      generateRequestHeader()
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      if (await refreshToken()) return;
      return await postRequest(url, body);
    }
    return error?.response?.data || { code: -1, message: "Request failed" };
  }
}

// Hàm GET request
export async function getRequest(url, { params } = {}) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER}${url}`,
      {
        ...generateRequestHeader(),
        params, // Đảm bảo params được truyền vào
      }
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      if (await refreshToken()) return;
      return await getRequest(url, { params });
    }
    return error?.response?.data || { code: -1, message: "Request failed" };
  }
}

// Hàm PUT request
export async function putRequest(url, body) {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_SERVER}${url}`,
      body,
      generateRequestHeader()
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      if (await refreshToken()) return;
      return await putRequest(url, body);
    }
    console.log("Error:", error?.response?.status, error?.response?.data);
    return error?.response?.data || { code: -1, message: "Request failed" };
  }
}

export async function putFormDataRequest(url, formData) {
  try {
    const { accessTokenKey } = getTokenKeysAndEndpoints();
    const response = await axios.put(
      `${process.env.REACT_APP_SERVER}${url}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem(accessTokenKey) || ""}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      if (await refreshToken()) return;
      return await putFormDataRequest(url, formData);
    }
    return error?.response?.data || { code: -1, message: "Request failed" };
  }
}


// Hàm DELETE request
export async function deleteRequest(url) {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_SERVER}${url}`,
      generateRequestHeader()
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      if (await refreshToken()) return;
      return await deleteRequest(url);
    }
    return error?.response?.data || { code: -1, message: "Request failed" };
  }
}

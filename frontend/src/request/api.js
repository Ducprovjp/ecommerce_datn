import axios from "axios";

// Định nghĩa kiểu dữ liệu response, tương tự ResponseDataType trong NestJS
export const ResponseDataType = {
  code: Number,
  message: String | Array,
  data: Object,
};

// Tạo hàm generateRequestHeader
export function generateRequestHeader() {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  };
}

// Hàm làm mới token
export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${process.env.REACT_APP_SERVER}/user/refresh-token`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    return false; // Làm mới thành công
  } catch (error) {
    console.error("Refresh token error:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    return true; // Làm mới thất bại
  }
}

// Hàm upload file
export async function uploadFileRequest(url, formData) {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_SERVER}${url}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
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
      return {
        code: -99,
        message: "File size exceeds 20MB",
      };
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
export async function getRequest(url) {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER}${url}`,
      generateRequestHeader()
    );
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      if (await refreshToken()) return;
      return await getRequest(url);
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
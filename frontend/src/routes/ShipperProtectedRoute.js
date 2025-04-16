import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";

const ShipperProtectedRoute = ({ children }) => {
  const { isLoading, isShipper } = useSelector((state) => state.shipper);

  if (isLoading === true) {
    return <Loader />;
  } else {
    if (!isShipper) {
      return <Navigate to={`/shipper-login`} replace />;
    }
    return children;
  }
};

export default ShipperProtectedRoute;

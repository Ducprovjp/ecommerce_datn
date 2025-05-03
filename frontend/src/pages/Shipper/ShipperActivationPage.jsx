import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ShipperActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (activation_token) {
      const activationEmail = async () => {
        try {
          const res = await axios.post(`${process.env.REACT_APP_SERVER}/shipper/activation`, {
            activation_token,
          });
        } catch (err) {
          console.log(err.response.data.message);
          setError(true);
        }
      };
      activationEmail();
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {error ? (
        <p className="text-red-800">Your token has expired</p>
      ) : (
        <p className="text-green-800">
          Your account has been created successfully!
        </p>
      )}
    </div>
  );
};

export default ShipperActivationPage;

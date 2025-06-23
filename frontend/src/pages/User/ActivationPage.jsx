import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { postRequest } from "../../request/api";

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (activation_token) {
      const activationEmail = async () => {
        try {
          const res = await postRequest(`/user/activation`, {
            activation_token,
          });
          console.log(res.message);
        } catch (err) {
          console.log(err.response.message);
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
        <p className="text-red-800">Your token is expired </p>
      ) : (
        <p className="text-green-800">
          Your Account has been created sucessfully!
        </p>
      )}
    </div>
  );
};

export default ActivationPage;

// src/components/ProfileContent/ProfileContent.jsx
import React from "react";
import ProfileSection from "./ProfileSection";
import AllOrders from "./AllOrders";
import AllRefundOrders from "./AllRefundOrders";
import TrackOrder from "./TrackOrder";
import ChangePassword from "./ChangePassword";
import Address from "./Address";

const ProfileContent = ({ active }) => {
  return (
    <div className="w-full">
      {active === 1 && <ProfileSection />}
      {active === 2 && <AllOrders />}
      {active === 3 && <AllRefundOrders />}
      {active === 5 && <TrackOrder />}
      {active === 6 && <ChangePassword />}
      {active === 7 && <Address />}
    </div>
  );
};

export default ProfileContent;
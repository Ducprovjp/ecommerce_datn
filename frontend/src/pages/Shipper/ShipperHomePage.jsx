import React from "react";
import styles from "../../styles/styles";
import ShipperInfo from "../../components/Shipper/ShipperInfo";

const ShipperHomePage = () => {
  return (
    <div className={`${styles.section} bg-[#f5f5f5]`}>
      <div className="w-full 800px:flex py-10 justify-between">
        <div className="800px:w-[25%] bg-[#fff] rounded-[4px] shadow-sm 800px:overflow-y-scroll 800px:h-[90vh] 800px:sticky top-10 left-0 z-10">
          <ShipperInfo isOwner={true} />
        </div>
      </div>
    </div>
  );
};

export default ShipperHomePage;

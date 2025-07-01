import React, { useState } from "react";
import ShopEditModal from "../../components/Shop/ShopEditModal"; // Thêm component mới
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import styles from "../../styles/styles";

const ShopHomePage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className={`${styles.section} bg-[#f5f5f5]`}>
      <div className="w-full 800px:flex py-10 justify-between">
        <div className="800px:w-[25%] bg-[#fff] rounded-[4px] shadow-sm 800px:overflow-y-scroll 800px:h-[90vh] 800px:sticky top-10 left-0 z-10">
          <ShopInfo 
            isOwner={true} 
            onEditClick={() => setIsEditModalOpen(true)} 
          />
        </div>
        <div className="800px:w-[72%] mt-5 800px:mt-['unset'] rounded-[4px]">
          <ShopProfileData isOwner={true} />
        </div>
      </div>

      {/* Modal edit shop */}
      {isEditModalOpen && (
        <ShopEditModal 
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ShopHomePage;
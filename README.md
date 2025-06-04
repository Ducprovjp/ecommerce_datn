<div align="center">
      <img width="226" alt="image" src="https://github.com/pattjoshi/Multi_vondor_E_shop/assets/78966839/51c0517e-e5e6-4a65-a520-9e5a52095fb9">

## 🌟 MERN Marketplace 🌟

The MERN Marketplace application will allow users to become sellers, who can manage  shops, and add the products they want to sell in each shop. Admin can control functionality of Seller Users who visit MERN Marketplace will be able to search for and browse products they want to buy, and add products to their shopping cart to place an order. we have 3 Order Method.
</div>

## 🖥️ Tech Stack
**Frontend:**

![reactjs](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;
![react-router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)&nbsp;
![redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)&nbsp;
![tailwindcss](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)&nbsp;
![mui](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)&nbsp;
![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)

**Backend:**

![nodejs](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)&nbsp;
![expressjs](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)&nbsp;
![mongodb](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)&nbsp;
![jwt](	https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)&nbsp;

**Realtime Communication:**

![socketio](https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=Socket.io&logoColor=white)

**package manager**

![Yarn](https://img.shields.io/badge/Yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white)

- **Show Error:** [Toastify](https://www.npmjs.com/package/react-toastify)           <br/>
- **Data Fetch from Backent:** [axios](https://www.npmjs.com/package/axios)   <br/>
- **Icons:** [react-icons](https://react-icons.github.io/react-icons/)   <br/>
- **Payment stripe:** [Strip](https://dashboard.stripe.com/login?redirect=%2Ftest%2Fpayments)   <br/>
- **Payment Paypal:** [Strip](https://www.paypal.com/in/home)   <br/>
- **Store Date in Cookes:** [js-cookie](https://www.npmjs.com/package/js-cookie)   <br/>
- **Sand maill to User,seller,Admin:** [nodemailer](https://www.npmjs.com/package/nodemailer)   <br/>
- **Store Img in Local Dev:**  [multer](https://www.npmjs.com/package/multer)

## 🚀 Features

- User Authentication Pages 🚪
  - User Signup 📝
    - email verification
    - upload a Profile image 
  - User Login 🔐
- Home Page 🏠
  - View all product uploads by seller 📃
  - filter with the category 📊
  - Best-selling product (Sort by Sold_out data) 💎
  - All Product 📦
  - All Event's 🎊
  - FAQ 🙋
- Filters for Sorting Posts 🗂️
  - Sort posts by Clothes, Shows, gifts, etc...
- User Search Bar 🔍
  - Search for product 🔎
  - Click on a user to go to the Product details page 👤
- wish list ❤️
  - store in cart 👀
- Add to cart 🛒
  - Check out for payment 💳
    - we have 3 payment systems **Pay-pal**,**Strip**,**Cash of Delivery (COD)**
- Apply Coupon Code for Discount 👉💥
- Product Explore Page 🔍
  - View Product from another seller 🌍
  - View reviews from other users ⭐
  - The eye button shows Product Details 👁
  - Original Price and discount price 💵
  - HowMeney Buy this product  🤝
  - Inc and Dec product  📉 +
  - Show Description of product 📃
  - View Seller Profile 👥
  - Chating with Seller 💬
  - Show Seller Information 📋
  - Show Related Products 🔗
  - Add to wish list ❤️
  - Add to Cart  🛒
- User Profile Page 👤
  - Edit your profile details - profile photo, name, email, phone number ✏️
  - change Password 🔐
  - View All Order 👨🏾‍💻.
  - After Delivery of the product user can Refund the product. 🔙
  - User inbox Chat with the seller. ✉️
  - Use can Track Orders. 🛤️
  - Store 3 Address Details. Like Default, Home, office. 📫
  - **Only Admin show Admin Dashboard** 👑
  - Logout 🔚
  - Create a Review After Delivery Product 🚛
  - After the Buy product is Sold out is increased. and Stock decrease in DB.

- Message ✉️
  - Sand Image 🖼️
  - Show active or not 🟢
  - Time of sand Message ⏰
- Popular Events 💥
  - Show Recent Events
- Responsive 📱
  - All screens are responsive
- Alerts 🚨
  - Alerts in the app to notify users about success/failure operations
- Seller Authentication Pages 🚪
  - Seller Signup 📝
    - shop name, Phone Number, Email address, Address,Zip Code, Password ✍
    - upload a Profile image 📷
    - email verification ✅
  -  Seller Login 🔐
- Seller Dashboard 👨🏻‍🔧
  - Overview of a Product and Latest Orders 🖇️
  - Account Balance (with 10% service charge) 💰
- All Orders ⚖
   - Seller Update Product Delivery status 📆
  - Create Products  ✔️
     - name*
     - Description *
     - Category *  like:- Computer and Laptops, Cosmetics and body care, Accessories, clothes,Shoes, Gifts, Pet Care, Mobile and Tablets, Music and Gaming, Other 🧩
  - All product 💻
     - Seller can delete Product ❌
    - View all Products 📦
 - Create an Event  💥🎉
    - name* 📇
   - Description *
   - Category *  like:- Computer and Laptops, Cosmetics and body care,Accessories, Clothes, Shoes,Gifts, Pet Care, Mobile and Tablets, Music and Gaming, Other
   - Tags
   - Original Price
   - Price (With Discount) *
   - Product Stock *
   - Event Start Date * ✅
   - Event End Date * (Default 3 days) ⛔
   - Upload multiple Images * 📷
- All Event 🎉
  - Show Event 💥
  - Delete Event  ⛔
- Withdraw Money 📥
  - Add Bank Details 🏛️
  - Not withdraw the highest amount of Balance 💱
  - Sand mail to sell with amount 📩
  - Delete Bank Details 🪧
- Shop Inbox 📞
    - All Messages 📬
    - Sand Image to user 🖼️
    - Show Activ function 🟢
- Discount Codes 🎟️
  - Create coupon code 🖱
  - Delete coupon code 🛑
  - apply all Products of the shop  🤩
  - Can apply the specific product 1️⃣☝️
- Refunds 🔙
  - Seller can update the Status of the Product 🔄
- Settings ⚛
  - update Images, Shop Address, Shop Phone Number, Shop Zip Code ⛓
  - Add Shop description 📖
- Shop Desboard 🎰
   - Shop Products 🌃
   - Running Events 🎪
   - Shop Reviews ⭐
   - Log out  ↪️
- Admin Authentication Pages (normal user in DB roll in Admin) 🚪
   - Admin Signup 📝
   - Admin Login 🔐
  - Overview 👔
        - Total Earning 🤑
        - All Sellers 👨‍🔧
        - All Orders 🛍️
        - Latest Orders 🔢
  - Show All Orders of Seller's 🛍️
  - Show All sellers and Delete ⛔
  - Show All users and Delete 👨‍👩‍👦‍👦 ⛔
  - All Products in DB. 👨🏻‍💻
  - All Events of Seller 📢
  - verify  Seller Withdraw request and Sand mail to update's 📧
  - if Delete images it also deletes from the local devise


## Project description 📝

🌟 Introducing MERN Marketplace: A Revolutionary Multi-Vendor Website 🌟

🚀 Dear LinkedIn Network, I am thrilled to announce the completion of my latest project, the MERN Marketplace! 🌟 This dynamic platform brings together buyers and sellers, offering a seamless online shopping experience with a plethora of innovative features.

💡 Key Technologies:
Front-End:

React 18:- user interface <Br/>

React Router:  client-side routing  <Br/>

Redux: Employing Redux for state management, ensuring centralized data handling and seamless interactions between components.<Br/>

Tailwind CSS: Leveraging the power of Tailwind CSS for streamlined and responsive UI design, enabling rapid development and customization. <Br/>

Material-UI: Integrating Material-UI components to enhance the visual appeal and usability of the website. <Br/>

Back-End:

Node.js: Utilizing Node.js as the server-side runtime environment to build scalable and efficient backend services. <Br/>

Express.js: Harnessing the power of Express.js, a fast and minimalist web application framework, to handle routing and middleware. <Br/>

JWT (JSON Web Tokens): Implementing JWT-based authentication for secure and stateless user sessions. <Br/>

MongoDB: Leveraging MongoDB, a NoSQL database, for efficient data storage and retrieval, enabling seamless scalability. <Br/>

Real-time Communication: Utilizing Socket.io to enable real-time communication between buyers, sellers, and the application server. <Br/>

Yarn: Employing Yarn as the package manager to manage project dependencies efficiently. <Br/>

Image Upload with Multer: Integrating Multer middleware to handle image uploads, ensuring seamless storage and retrieval of product images. <Br/>

Email Communication with Nodemailer: Implementing Nodemailer to facilitate email communication, including email verification and notifications. <Br/>

💡 Key Features:
1️⃣ User Authentication Pages 🚪

User Signup: Enable users to create accounts, complete with email verification and the option to upload a profile image. <Br/>

User Login: Secure login functionality to protect user accounts.

2️⃣ Home Page 🏠

View Seller Products: Showcase all product uploads by sellers, allowing users to browse and explore various offerings. <Br/>

Category Filters: Implement filters to help users narrow down their search by selecting specific product categories. <Br/>

Best-Selling Products: Highlight popular products based on the number of units sold, aiding users in making informed decisions. <Br/>

Events Section: Display all upcoming events, fostering engagement and excitement among users.<Br/>

Frequently Asked Questions (FAQ): Provide a dedicated section to address common user queries. <Br/>

3️⃣ Filters for Sorting Posts 🗂️

Sort by Category: Enable users to filter posts by different categories, such as clothes, shoes, gifts, and more.

4️⃣ User Search Bar 🔍

Search Functionality: Implement a robust search feature, allowing users to search for specific products or click on user profiles to view their offerings.

5️⃣ Wishlist and Cart Management ❤️🛒

Wishlist: Enable users to add products to their wishlist, saving them for future reference. <Br/>

Add to Cart: Provide a seamless shopping experience by allowing users to add products to their cart for purchase. <Br/>

Checkout and Payment: Implement a secure payment system, supporting PayPal, Stripe, and Cash on Delivery (COD) options. <Br/>

Apply Coupon Code: Allow users to apply coupon codes for discounts during the checkout process. <Br/>

6️⃣ Product Explore Page 🔍

Detailed Product Information: Display product details, including original and discounted prices, descriptions, seller information, and related products. <Br/>

Seller Interaction: Facilitate direct communication between users and sellers through chat functionality. <Br/>

Reviews and Ratings: Showcase reviews and ratings from other users to help inform purchasing decisions. <Br/>

7️⃣ User Profile Page 👤

Profile Editing: Allow users to edit their profile details, including profile photos, names, email addresses, and phone numbers. <Br/>

Order History: Provide users with an overview of all their previous orders, allowing them to track deliveries and request refunds if necessary. <Br/>

Inbox and Chat: Enable users to communicate with sellers, fostering a seamless exchange of information. <Br/>

Address Management: Allow users to store multiple addresses for efficient checkout, including default, home, and office options. <Br/>

8️⃣ Seller Dashboard 👨🏻‍🔧

Product and Order Management: Provide sellers with an overview of their products and the latest orders, along with the ability to update delivery statuses. <Br/>

Event Creation: Allow sellers to create and manage events, including details such as event name, description, category, dates, and images. <Br/>

Shop Settings: This enables sellers to update their shop information, including images, addresses, phone numbers, and descriptions. <Br/>

Inbox and Communication: Facilitate communication between sellers and users, ensuring a smooth exchange of information. <Br/>

9️⃣ Admin Dashboard 👑

Admin Authentication: Implement secure login functionality for admins. <Br/>

Overview and Analytics: Provide admins with an overview of total earnings, all sellers, all orders, and the latest orders. <Br/>

Seller and User Management: Enable admins to manage sellers and users, including the ability to delete accounts if necessary. <Br/>

Product and Event Management: Allow admins to view all products and events in the database, facilitating efficient management. <Br/>

Withdrawal Management: Provide admins with the ability to verify seller withdrawal requests, update balances, and send email notifications. <Br/>

Image Management: Enable admins to delete images, ensuring data integrity and storage optimization. <Br/>

🚀 With the power of these cutting-edge technologies, the MERN Marketplace delivers a robust and feature-rich multi-vendor website. It ensures a seamless user experience, efficient data management, real-time communication, and secure transactions. Join me in revolutionizing the e-commerce experience by connecting buyers and sellers in a dynamic and user-friendly environment.

Feel free to reach out to me for more information or to explore collaboration opportunities.

#MERNMarketplace #Ecommerce #React #NodeJS #ExpressJS #MongoDB #SocketIO #TailwindCSS #MaterialUI #Innovation #OnlineShopping #RevolutionizingRetail

#### _**IMPORTANT NOTE**_ - 
This project does not have a mongoDB connection setup. Set up the connection based on the environments below.
- local development: create a config folder (make sure to name it .env) in the config folder, which exports your db.uri connection.
-  (make new folder `uploads`) in the backend.


## File structure
#### `client` - Holds the client application
- #### `public` - This holds all of our static files
- #### `src`
    - #### `assets` - This folder holds assets such as images, docs, and fonts
    - #### `components` - This folder holds all of the different components that will make up our views
      - Admin
      - cart
      - Checkout
      - Events
      - layout
      - Logout
      - Payment
      - Products
      - Profile
      - Route
      - Shop
      - Signup
      - Wishlist
     - #### `pages` - This folder holds All pages Admin, shop, user
       - Shop
     - #### `redux` - This folder holds all states of the Web app
       - action
       - reducer
     - #### `static` - This folder holds Static file like logo categorie
    - #### `App.js` - This is what renders all of our browser routes and different views
    - #### `index.js` - This is what renders the react app by rendering App.js, should not change
- #### `package.json` - Defines npm behaviors and packages for the client
#### `server` - Holds the server application
- #### `config` - This holds our configuration files, like mongoDB uri
- #### `controller` - These hold all of the callback functions that each route will call
- #### `db` - These hold all of Data Base Connection
- #### `middleware` - These hold all error handle
- #### `models` - This holds all of our data models
- #### `uploads` - Store all image in hear
- #### `utils` - This holds all of our HTTP to URL. jwtToken and sand mail, Token gentrare
- #### `mlter.js` - Sand mail login
- #### `server.js` - Defines npm behaviors and packages for the client
- #### `package.json` - Defines npm behaviors like the scripts defined in the next section of the README
#### `socket` - Socket.io is use to chaing feacher
  - .env
  - index.js
  - package.json
#### `.gitignore` - Tells git which files to ignore
#### `README` - This file!

---

💻 How to run the app locally! 🏃

### STAP-1
`git clone https://github.com/pattjoshi/Multi_vondor_E_shop.git`

### STAP-2
- `cd frontend`
- `yarn install`
- `yarn start`

### STAP-3
- `cd backend`
- `yarn install`
- create folder `uploads`
- create `confilg` folder and a `.env` file
- use your Cradincial in.env file

```
PORT = 8000
DB_URL = ""
JWT_SECRET_KEY = ""
JWT_EXPIRES = 7d
ACTIVATION_SECRET = 
SMPT_HOST = 'smtp.gmail.com'
SMPT_PORT = 465
SMPT_PASSWORD = 
SMPT_MAIL =
STRIPE_API_KEY = 
STRIPE_SECRET_KEY = 
```
- `yarn start`

### STAP-4

- `cd socket`
- `yarn install`
- create a `.env` file
```
PORT = 4000
```
- `yarn start`


## YouTub :- [I Learn from this ](https://www.youtube.com/watch?v=XxnUSZOgMLY&list=PLyah27R0n8V4Kcao94Qlt-xJ0bHxZfBjk "click to open")

🙏 If you find this repo helpful then don't forget to give a star ❇️ to this repository. :)

<p align="center"><a href="https://github.com/nastyox/Rando.js#nastyox"><img src="http://randojs.com/images/barsSmallTransparentBackground.gif" alt="Animated footer bars" width="100%"/></a></p>
<br/>
<p align="center"><a href="https://github.com/pattjoshi/Multi_vondor_E_shop#"><img src="http://randojs.com/images/backToTopButtonTransparentBackground.png" alt="Back to top" height="29"/></a></p>


@copyright by Om Pattjoshi 2023

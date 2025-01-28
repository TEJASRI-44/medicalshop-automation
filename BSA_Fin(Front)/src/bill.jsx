import React,{useState} from "react";
import { useLocation, useNavigate,useOutletContext } from "react-router-dom";
import "./bill.css";
import axios from 'axios';

const BillPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {  setCartCount, customer, checkout} = useOutletContext();
  const [cartDetails, setCartDetails] = useState([]);
  const { quantities, cartItems, address, city, stateField, zip } =
    location.state || {};

  if (!quantities || !cartItems || !address || !city || !stateField || !zip) {
    return (
      <div className="bill-page">
        <h2>Invalid Order Details</h2>
        <button onClick={() => navigate("/body/cart")} className="back-button">
          Go to Cart
        </button>
      </div>
    );
  }

  const totalCost = cartItems.reduce(
    (acc, item) => acc + item.unitSellingPrice * (quantities[item.code] || 1),
    0
  );
  const handleCheckout = async () => {
      try {
        await axios.post(`http://localhost:8081/cart/checkout/${customer.id}`);
        setCartDetails([]);
        setCartCount(0); // Reset cart count
        checkout(quantities); // Call checkout function from context if needed
        navigate("/body");
      } catch (error) {
        console.error("There was an error during checkout!", error);
      }
    };
  return (
    <div className="bill-page receipt">
      <h2 className="receipt-header">Order Receipt</h2>
      <div className="receipt-section">
        <h3>Shipping Address</h3>
        <p>{address}</p>
        <p>
          {city}, {stateField} - {zip}
        </p>
      </div>

      <div className="receipt-section">
        <h3>Itemized Bill</h3>
        {cartItems.map((item, index) => (
          <div key={index} className="bill-item">
            <div className="item-header">
              <span className="item-name">{item.tradeName}</span>
              <span className="item-cost">
                ₹{item.unitSellingPrice * (quantities[item.code] || 1)}
              </span>
            </div>
            <div className="item-details">
              <span>Quantity: {quantities[item.code] || 1}</span>
              <span>Price per item: ₹{item.unitSellingPrice}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="receipt-section total-cost">
        <h3>
          Total Cost: <span>₹{totalCost}</span>
        </h3>
      </div>
      <button onClick={handleCheckout} className="home-button">
        Back to Home
      </button>
    </div>
  );
};

export default BillPage;

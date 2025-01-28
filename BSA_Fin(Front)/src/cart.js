import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './cart.css';

const Cart = () => {
  const { removeFromCart, setCartCount, customer, checkout ,cartItems} = useOutletContext();
  const navigate = useNavigate();
  const [cartDetails, setCartDetails] = useState([]);
  const [quantities, setQuantities] = useState({});
  

  // Fetch cart details from the server when the component mounts
  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const response = await axios.get('http://localhost:8081/cart');
        setCartDetails(response.data);
        // Initialize quantities for each item
        const initialQuantities = response.data.reduce((acc, item) => {
          acc[item.medicine.id] = 1; // Default quantity
          return acc;
        }, {});
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("There was an error fetching cart details!", error);
      }
    };

    fetchCartDetails();
  }, []);

  const handleQuantityChange = async (medicineId, newQuantity) => {
    setQuantities({ ...quantities, [medicineId]: newQuantity });

    try {
      // Call the backend to update the quantity
      const response = await axios.put(
        'http://localhost:8081/cart/updateQuantity',
        null,
        {
          params: {
            customerId: customer.id,
            medicineId: medicineId,
            quantity: newQuantity,
          },
        }
      );
      console.log("Quantity updated:", response.data);
    } catch (error) {
      console.error("There was an error updating the quantity!", error);
    }
  };

  // Handle removing an item from the cart on the server
  const handleRemoveFromCart = async (cartId) => {
    try {
      await axios.delete(`http://localhost:8081/cart/${cartId}`);
      setCartDetails(cartDetails.filter(item => item.id !== cartId));
      removeFromCart(cartId);
      setCartCount(cartDetails.length - 1); // Update cart count
    } catch (error) {
      console.error("There was an error removing the item from the cart!", error);
    }
  };

  const handleCheckout = async () => {
    checkout(quantities); // Call checkout function from context if needed
    navigate("/body/shipping",{state:{quantities,cartItems}});
  }
  // Handle checkout process
  // const handleCheckout = async () => {
  //   try {
  //     await axios.post(`http://localhost:8081/cart/checkout/${customer.id}`);
  //     setCartDetails([]);
  //     setCartCount(0); // Reset cart count
  //     checkout(quantities); // Call checkout function from context if needed
  //     navigate("/body/shipping");
  //   } catch (error) {
  //     console.error("There was an error during checkout!", error);
  //   }
  // };

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {customer && <p>Welcome, {customer.name}!</p>}
      {cartDetails.length === 0 ? (
        <p>No items in the cart</p>
      ) : (
        cartDetails.map((item) => (
          <div className="cart-item" key={item.id}>
            <img src={item.medicine.imageUrl} alt={item.medicine.tradeName} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.medicine.tradeName}</h3>
              <p>{item.medicine.genericName}</p>
              <p>Price: ₹{item.medicine.unitSellingPrice}</p>
              <div className="quantity-container">
                <label htmlFor={`quantity-${item.medicine.id}`}>Quantity:</label>
                <input
                  type="number"
                  id={`quantity-${item.medicine.id}`}
                  value={quantities[item.medicine.id] || 1}
                  min="1"
                  onChange={(e) => handleQuantityChange(item.medicine.id, parseInt(e.target.value))}
                  className="quantity-input"
                />
              </div>
              <button onClick={() => handleRemoveFromCart(item.id)} className="remove-button">
                Remove
              </button>
            </div>
          </div>
        ))
      )}
      {cartDetails.length > 0 && (
        <button onClick={handleCheckout} className="checkout-button">
          Checkout
        </button>
      )}
    </div>
  );
};

export default Cart;

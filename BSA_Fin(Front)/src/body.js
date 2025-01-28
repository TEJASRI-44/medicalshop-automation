import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import './body.css';
import axios from 'axios';

const Body = () => {
  const { customer, addToCart } = useOutletContext(); // Get customer and addToCart from context
  const [medicines, setMedicines] = useState([]); // Store medicines from API
  const [searchText, setSearchText] = useState(""); // Search text for filtering
  const defaultQuantity = 1; // Set a default quantity

  useEffect(() => {
    
    // Fetch medicines from backend
    const fetchMedicines = async () => {
      try {
        const response = await axios.get('http://localhost:8081/medicine');
        setMedicines(response.data);
      } catch (error) {
        console.error("There was an error fetching the medicines data!", error);
      }
    };

    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.tradeName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (e) => setSearchText(e.target.value);

  // Function to add medicine to the cart
  const handleAddToCart = async (medicine) => {
    try {
      console.log(medicine);
      console.log(customer.id); // Ensure this is the correct property name for the customer ID
      const response = await axios.post(`http://localhost:8081/cart/add?customerId=${customer.id}&medicineId=${medicine.id}&quantity=${defaultQuantity}`);
      
      if (response.status === 201) {
        console.log('Medicine added to cart:', response.data);
        addToCart(medicine); // Update local state
      }
    } catch (error) {
      console.error("There was an error adding the medicine to the cart!", error);
    }
  };

  return (
    <div className="body">
      <div className="body-search-cart">
        <input
          type="text"
          placeholder="Search for medicines..."
          className="search-input form-control"
          value={searchText}
          onChange={handleSearchChange}
        />
      </div>
      <div className="Card-container">
        {filteredMedicines.length > 0 ? (
          filteredMedicines.map((medicine, index) => (
            <div className="card" key={index}>
              <img
                src={medicine.imageUrl}
                alt={medicine.tradeName}
                className="card-image"
              />
              <div className="card-content">
                <h3 className="card-title">{medicine.tradeName}</h3>
                <p className="card-price">₹{medicine.unitSellingPrice}</p>
                <p className="card-description">{medicine.genericName}</p>
                <div className="card-buttons">
                  <button
                    className="cart-button"
                    onClick={() => handleAddToCart(medicine)}
                  >
                    Add to Cart
                  </button>
                  
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">No medicines found for "{searchText}"</p>
        )}
      </div>
    </div>
  );
};

export default Body;

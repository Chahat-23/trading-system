import { useState } from "react";
import axios from "axios";

const TradeForm = () => {
  const [order, setOrder] = useState({
    side: "bid",
    price: "",
    quantity: "",
    userId: "1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert price and quantity to numbers before sending
      const orderData = {
        ...order,
        price: Number(order.price),
        quantity: Number(order.quantity),
      };

      await axios.post("http://localhost:3001/order", orderData);
      setOrder({ ...order, price: "", quantity: "" });
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert to number if it's price or quantity
    const numValue =
      name === "price" || name === "quantity" ? Number(value) : value;
    setOrder((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  return (
    <div className="card">
      <h2>Place Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Side</label>
          <select name="side" value={order.side} onChange={handleInputChange}>
            <option value="bid">Buy</option>
            <option value="ask">Sell</option>
          </select>
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={order.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={order.quantity}
            onChange={handleInputChange}
            min="0"
            step="1"
          />
        </div>

        <button type="submit">Place Order</button>
      </form>
    </div>
  );
};

export default TradeForm;

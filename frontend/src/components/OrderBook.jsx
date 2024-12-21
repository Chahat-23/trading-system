import { useEffect, useState } from "react";
import axios from "axios";

const OrderBook = () => {
  const [depth, setDepth] = useState({});

  useEffect(() => {
    const fetchDepth = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/depth");
        setDepth(data.depth);
      } catch (error) {
        console.error("Error fetching depth:", error);
      }
    };

    fetchDepth();
    const interval = setInterval(fetchDepth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h2>Order Book</h2>
      <table>
        <thead>
          <tr>
            <th>Price</th>
            <th>Quantity</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(depth).map(([price, { quantity, type }]) => (
            <tr key={price}>
              <td>{price}</td>
              <td>{quantity}</td>
              <td className={type}>{type.toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderBook;

import { useEffect, useState } from "react";
import axios from "axios";

const UserBalance = () => {
  const [balances, setBalances] = useState({ USD: 0, GOOGLE: 0 });

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/balance/1");
        setBalances(data.balances);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h2>Your Balance</h2>
      <p>USD: ${balances.USD}</p>
      <p>GOOGLE: {balances.GOOGLE} shares</p>
    </div>
  );
};

export default UserBalance;

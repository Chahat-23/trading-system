import { useState } from "react";
import OrderBook from "./components/OrderBook";
import TradeForm from "./components/TradeForm";
import UserBalance from "./components/UserBalance";
import "./styles.css";

function App() {
  return (
    <div className="container">
      <UserBalance />
      <TradeForm />
      <OrderBook />
    </div>
  );
}

export default App;

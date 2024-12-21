import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const TICKER = "GOOGLE";

const users = [
  {
    id: "1",
    balances: { GOOGLE: 10, USD: 50000 },
  },
  {
    id: "2",
    balances: { GOOGLE: 10, USD: 50000 },
  },
];

const bids = [];
const asks = [];

app.get("/", (req, res) => {
  res.json({ message: "Trading API is running" });
});

// Fixed flipBalance function
function flipBalance(sellerId, buyerId, quantity, price) {
  const seller = users.find((x) => x.id === sellerId);
  const buyer = users.find((x) => x.id === buyerId);

  if (!seller || !buyer) {
    return false;
  }

  // Check if seller has enough GOOGLE tokens
  if (seller.balances[TICKER] < quantity) {
    return false;
  }

  // Check if buyer has enough USD
  if (buyer.balances.USD < quantity * price) {
    return false;
  }

  // Update balances
  seller.balances[TICKER] -= quantity;
  buyer.balances[TICKER] += quantity;
  seller.balances.USD += quantity * price;
  buyer.balances.USD -= quantity * price;

  return true;
}

// Fixed fillOrders function
function fillOrders(side, price, quantity, userId) {
  // Ensure all inputs are numbers
  const numPrice = Number(price);
  const numQuantity = Number(quantity);
  let remainingQuantity = numQuantity;

  if (side === "bid") {
    asks.sort((a, b) => Number(a.price) - Number(b.price));
    
    for (let i = 0; i < asks.length && remainingQuantity > 0; i++) {
      if (Number(asks[i].price) > numPrice) {
        break;
      }

      const askOrder = asks[i];
      const fillQuantity = Math.min(remainingQuantity, Number(askOrder.quantity));

      if (flipBalance(askOrder.userId, userId, fillQuantity, Number(askOrder.price))) {
        remainingQuantity -= fillQuantity;
        askOrder.quantity = Number(askOrder.quantity) - fillQuantity;

        if (askOrder.quantity === 0) {
          asks.splice(i, 1);
          i--;
        }
      }
    }
  } else {
    bids.sort((a, b) => Number(b.price) - Number(a.price));
    
    for (let i = 0; i < bids.length && remainingQuantity > 0; i++) {
      if (Number(bids[i].price) < numPrice) {
        break;
      }

      const bidOrder = bids[i];
      const fillQuantity = Math.min(remainingQuantity, Number(bidOrder.quantity));

      if (flipBalance(userId, bidOrder.userId, fillQuantity, Number(bidOrder.price))) {
        remainingQuantity -= fillQuantity;
        bidOrder.quantity = Number(bidOrder.quantity) - fillQuantity;

        if (bidOrder.quantity === 0) {
          bids.splice(i, 1);
          i--;
        }
      }
    }
  }

  return remainingQuantity;
}


app.post("/order", (req, res) => {
  const { side, price, quantity, userId } = req.body;
  
  // Ensure price and quantity are numbers
  const numPrice = Number(price);
  const numQuantity = Number(quantity);

  // Validate input
  if (isNaN(numPrice) || isNaN(numQuantity) || !userId) {
    return res.status(400).json({ 
      error: "Invalid input parameters. Price and quantity must be numbers." 
    });
  }

  // Check if user exists
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Validate user has sufficient balance
  if (side === "bid" && user.balances.USD < numPrice * numQuantity) {
    return res.status(400).json({ error: "Insufficient USD balance" });
  }
  if (side === "ask" && user.balances[TICKER] < numQuantity) {
    return res.status(400).json({ error: "Insufficient GOOGLE balance" });
  }

  const remainingQty = fillOrders(side, numPrice, numQuantity, userId);

  if (remainingQty > 0) {
    const order = {
      userId,
      price: numPrice,
      quantity: remainingQty,
    };

    if (side === "bid") {
      bids.push(order);
      bids.sort((a, b) => b.price - a.price);
    } else {
      asks.push(order);
      asks.sort((a, b) => a.price - b.price);
    }
  }

  res.json({
    filledQuantity: numQuantity - remainingQty,
    remainingQuantity: remainingQty,
  });
});


app.get("/depth", (req, res) => {
  const depth = {};

  // Add bids to depth
  for (const bid of bids) {
    if (!depth[bid.price]) {
      depth[bid.price] = { quantity: 0, type: "bid" };
    }
    depth[bid.price].quantity += bid.quantity;
  }

  // Add asks to depth
  for (const ask of asks) {
    if (!depth[ask.price]) {
      depth[ask.price] = { quantity: 0, type: "ask" };
    }
    depth[ask.price].quantity += ask.quantity;
  }

  res.json({ depth });
});

app.get("/balance/:userId", (req, res) => {
  const userId = req.params.userId;
  const user = users.find((x) => x.id === userId);
  
  if (!user) {
    return res.json({ balances: { USD: 0, [TICKER]: 0 } });
  }
  
  res.json({ balances: user.balances });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

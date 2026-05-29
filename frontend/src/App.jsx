import axios from "axios";

function App() {
  const handleCheckout = async () => {
    const response = await axios.post(
      "http://localhost:5000/api/payments/create-checkout-session",
      {
        productId: "6a19cc200d33d6ee257003d2",
      }
    );

    window.location.href = response.data.url;
  };

  return (
    <div>
      <button onClick={handleCheckout}>
        Buy Product
      </button>
    </div>
  );
}

export default App;
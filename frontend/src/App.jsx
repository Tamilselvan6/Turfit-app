import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TurfDetails from "./pages/TurfDetails";
import TurfBooking from "./pages/TurfBooking";
import TurfPayment from "./pages/TurfPayment"; // Import the Payment component
import ConfirmationPage from "./pages/ConfirmationPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/turf/:id" element={<TurfDetails />} />
        <Route path="/book/:id" element={<TurfBooking />} />
        <Route path="/payment/:id" element={<TurfPayment />} /> {/* Add this route */}
        <Route path="/ConfirmationPage" element={<ConfirmationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
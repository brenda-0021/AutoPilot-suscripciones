import { useState } from "react";
import { X } from "lucide-react";
import PropTypes from "prop-types";

const categories = [
  "Entertainment",
  "Sports",
  "Shopping",
  "Utilities",
  "Education",
  "Health & Fitness",
  "Food & Drink",
  "Travel",
  "Technology",
  "Other",
];

export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 ">
      <div className="bg-purpura/90 backdrop-blur-md p-10 rounded-lg shadow-lg max-w-lg w-full">
        <button onClick={onClose} className="float-right text-white">
          <X className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export function SubscriptionForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    platformName: "",
    category: "",
    paymentDate: "",
    cycle: "monthly",
    price: "",
    reminder: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Add New Subscription
      </h2>
      <input
        name="platformName"
        value={formData.platformName}
        onChange={handleChange}
        placeholder="Platform Name"
        className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro"
        required
      />
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="w-full p-2 rounded bg-grisFuerte/50 text-white"
        required
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="paymentDate"
        value={formData.paymentDate}
        onChange={handleChange}
        className="w-full p-2 rounded bg-grisFuerte/50 text-white"
        required
      />
      <select
        name="cycle"
        value={formData.cycle}
        onChange={handleChange}
        className="w-full p-2 rounded bg-grisFuerte/50 text-white"
        required
      >
        <option value="monthly">Monthly</option>
        <option value="annually">Annually</option>
      </select>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price"
        className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro"
        required
      />
      <input
        type="number"
        name="reminder"
        value={formData.reminder}
        onChange={handleChange}
        placeholder="Reminder (days before)"
        className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-rosa text-white rounded-full hover:bg-vino transition-all duration-200"
      >
        Add Subscription
      </button>
    </form>
  );
}

SubscriptionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default function SubsModal({ isOpen, onClose, onSubmit }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <SubscriptionForm onSubmit={onSubmit} onClose={onClose} />
    </Modal>
  );
}

SubsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

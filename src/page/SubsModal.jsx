import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
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

const cycles = [
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-rosa/70 backdrop-blur-md p-10 rounded-2xl shadow-lg max-w-lg w-full">
        <button
          onClick={onClose}
          className="float-right text-white hover:text-rosa transition-colors"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
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

function SubscriptionForm({ onSubmit, onClose, initialData }) {
  const [formData, setFormData] = useState({
    platformName: "",
    category: "",
    paymentDate: "",
    cycle: "monthly",
    price: "",
    reminder: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
        {initialData ? "Edit Subscription" : "Add New Subscription"}
      </h2>
      <input
        name="platformName"
        value={formData.platformName}
        onChange={handleChange}
        placeholder="Platform Name"
        className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro focus:outline-none focus:ring-2 focus:ring-rosa"
        required
      />
      <div className="relative w-full">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 pr-10 rounded bg-grisFuerte/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rosa"
          required
        >
          <option value="" disabled className="text-rosa bg-purpura">
            Select Category
          </option>
          {categories.map((category) => (
            <option
              key={category}
              value={category}
              className="bg-purpura text-white hover:bg-rosa"
            >
              {category}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" />
      </div>
      <input
        type="date"
        name="paymentDate"
        value={formData.paymentDate}
        onChange={handleChange}
        className="w-full p-2 rounded bg-grisFuerte/50 text-white focus:outline-none focus:ring-2 focus:ring-rosa"
        required
      />
      <div className="relative">
        <select
          name="cycle"
          value={formData.cycle}
          onChange={handleChange}
          className="w-full p-2 pr-10 rounded bg-grisFuerte/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-rosa"
          required
        >
          {cycles.map((cycle) => (
            <option
              key={cycle.value}
              value={cycle.value}
              className="bg-purpura text-white hover:bg-rosa"
            >
              {cycle.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" />
      </div>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price"
        className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro focus:outline-none focus:ring-2 focus:ring-rosa"
        required
      />
      <input
        type="number"
        name="reminder"
        value={formData.reminder}
        onChange={handleChange}
        placeholder="Reminder (days before)"
        className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro focus:outline-none focus:ring-2 focus:ring-rosa"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-rosa text-white rounded-full hover:bg-vino transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rosa"
      >
        {initialData ? "Update Subscription" : "Add Subscription"}
      </button>
    </form>
  );
}

SubscriptionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

export default function SubsModal({ isOpen, onClose, onSubmit, initialData }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <SubscriptionForm
        onSubmit={onSubmit}
        onClose={onClose}
        initialData={initialData}
      />
    </Modal>
  );
}

SubsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import {
  siNetflix,
  siHbo,
  siPrimevideo,
  siCrunchyroll,
  siSpotify,
  siApple,
  siAmazonmusic,
  siYoutube,
  siPlaystation,
  siSteam,
  siNintendoswitch,
  siEpicgames,
  siAdobe,
  siNotion,
  siCanva,
  siDropbox,
  siSlack,
  siGooglecloud,
  siIcloud,
} from "simple-icons";

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

const brandIcons = {
  Netflix: siNetflix,
  HBO: siHbo,
  "Amazon Prime": siPrimevideo,
  Crunchyroll: siCrunchyroll,
  Spotify: siSpotify,
  Apple: siApple,
  "Amazon Music": siAmazonmusic,
  YouTube: siYoutube,
  PlayStation: siPlaystation,
  Steam: siSteam,
  "Nintendo Switch": siNintendoswitch,
  "Epic Games": siEpicgames,
  Adobe: siAdobe,
  Notion: siNotion,
  Canva: siCanva,
  Dropbox: siDropbox,
  Slack: siSlack,
  "Google Cloud": siGooglecloud,
  iCloud: siIcloud,
};

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
  const [phase, setPhase] = useState("brands");

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        paymentDate: new Date(initialData.paymentDate)
          .toISOString()
          .split("T")[0],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submittedData = {
      ...formData,
      paymentDate: new Date(formData.paymentDate),
      price: parseFloat(formData.price),
      reminder: parseInt(formData.reminder, 10),
    };
    onSubmit(submittedData);
    onClose();
  };

  const handleBrandSelect = (brandName) => {
    setFormData((prev) => ({ ...prev, platformName: brandName }));
    setPhase("form");
  };

  const renderIcon = (icon, size = 50) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={`#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );

  if (phase === "brands") {
    return (
      <div className="space-y-7">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Select a Sub
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(brandIcons).map(([brandName, icon]) => (
            <button
              key={brandName}
              onClick={() => handleBrandSelect(brandName)}
              className="p-2 flex flex-col items-center justify-center  rounded-xl hover:bg-white/30 transition-colors"
            >
              {renderIcon(icon, 50)}
              <p className="mt-2 text-sm text-white">{brandName}</p>
            </button>
          ))}
          <button
            onClick={() => handleBrandSelect("")}
            className="p-2 flex flex-col items-center justify-center rounded-xl hover:bg-white/30 transition-colors"
          >
            {/* Ícono genérico */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 23 23"
              width={50}
              height={50}
              fill="white"
            >
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
            </svg>
            <p className="mt-2 text-sm text-white">Other</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        {initialData ? "Edit Subscription" : "Add New Subscription"}
      </h2>
      <input
        name="platformName"
        value={formData.platformName}
        onChange={handleChange}
        placeholder="Platform Name"
        className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
        required
      />
      <div className="relative w-full">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/50 text-purpura appearance-none placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
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
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purpura pointer-events-none" />
      </div>
      <input
        type="date"
        name="paymentDate"
        value={formData.paymentDate}
        onChange={handleChange}
        className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
        required
      />
      <div className="relative">
        <select
          name="cycle"
          value={formData.cycle}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/50 text-purpura appearance-none placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
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
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purpura pointer-events-none" />
      </div>
      <div className="flex flex-wrap -mx-2 mb-2">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
            required
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <input
            type="number"
            name="reminder"
            value={formData.reminder}
            onChange={handleChange}
            placeholder="Reminder (days before)"
            className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-3  bg-rosa text-white rounded-full hover:bg-vino transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rosa"
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

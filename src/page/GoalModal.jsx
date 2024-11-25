import { useState, useEffect } from "react";
import { X } from "lucide-react";

const GoalModal = ({ isOpen, onClose, onSave, editingGoal }) => {
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState(0);
  const [goalSaved, setGoalSaved] = useState(0);

  useEffect(() => {
    if (editingGoal) {
      setGoalName(editingGoal.name || "");
      setGoalTarget(editingGoal.target || 0);
      setGoalSaved(editingGoal.saved || 0);
    }
  }, [editingGoal]);

  const handleSave = () => {
    if (!goalName || goalTarget <= 0) {
      alert("Please enter valid goal details.");
      return;
    }

    onSave({
      id: editingGoal ? editingGoal.id : Date.now(),
      name: goalName,
      target: goalTarget,
      saved: goalSaved,
    });

    // Limpia los campos después de guardar
    setGoalName("");
    setGoalTarget(0);
    setGoalSaved(0);
    onClose();
  };

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
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {editingGoal ? "Edit Savings Goal" : "Add New Savings Goal"}
        </h2>
        <form>
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro focus:outline-none focus:ring-2 focus:ring-rosa"
              placeholder="Goal Name"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro focus:outline-none focus:ring-2 focus:ring-rosa"
              placeholder="Target Amount"
              value={goalTarget}
              onChange={(e) => setGoalTarget(Number(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              className="w-full p-2 rounded bg-grisFuerte/50 text-white placeholder-grisClaro focus:outline-none focus:ring-2 focus:ring-rosa"
              placeholder="Amount Saved"
              value={goalSaved}
              onChange={(e) => setGoalSaved(Number(e.target.value))}
            />
          </div>

          <button
            type="button"
            className="w-full px-4 py-2 bg-rosa text-white rounded-full hover:bg-vino transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rosa"
            onClick={handleSave}
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;

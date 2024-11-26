import { useState, useEffect } from "react";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import { db } from "../firebase/firebase.config";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const GoalModal = ({ isOpen, onClose, onSave, editingGoal }) => {
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState(0);
  const [goalSaved, setGoalSaved] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState("");

  useEffect(() => {
    if (editingGoal) {
      setGoalName(editingGoal.name || "");
      setGoalTarget(editingGoal.target || 0);
      setGoalSaved(editingGoal.saved || 0);
      setGoalDeadline(editingGoal.deadline || "");
    } else {
      setGoalName("");
      setGoalTarget(0);
      setGoalSaved(0);
      setGoalDeadline("");
    }
  }, [editingGoal]);

  const handleSave = async () => {
    if (!goalName || goalTarget <= 0) {
      alert("Please enter valid goal details.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to save a goal.");
      return;
    }

    const goalData = {
      id: editingGoal ? editingGoal.id : Date.now().toString(),
      name: goalName,
      target: parseFloat(goalTarget),
      saved: parseFloat(goalSaved),
      deadline: goalDeadline,
      userId: user.uid,
    };

    try {
      await setDoc(doc(db, "savingsGoals", goalData.id), goalData);
      onSave(goalData);
      onClose();
    } catch (error) {
      console.error("Error saving goal: ", error);
      alert("Failed to save goal. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!editingGoal) return;

    try {
      await deleteDoc(doc(db, "savingsGoals", editingGoal.id));
      onClose();
    } catch (error) {
      console.error("Error deleting goal: ", error);
      alert("Failed to delete goal. Please try again.");
    }
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
        <h2 className="text-2xl font-bold text-white mb-8 text-center">
          {editingGoal ? "Edit Savings Goal" : "Add New Savings Goal"}
        </h2>
        <form className="space-y-7">
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
              placeholder="Goal Name"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
              placeholder="Target Amount"
              value={goalTarget === 0 ? "" : goalTarget} // Empty when 0
              onChange={(e) => setGoalTarget(Number(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <input
              type="number"
              className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
              placeholder="Amount Saved"
              value={goalSaved === 0 ? "" : goalSaved} // Empty when 0
              onChange={(e) => setGoalSaved(Number(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <input
              type="date"
              className="w-full p-2 rounded bg-white/50 text-purpura placeholder-grisClaro focus:shadow-lg focus:shadow-purpura focus:outline-none focus:ring-2 focus:ring-rosa"
              placeholder="Goal Deadline"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="w-full px-4 py-2 bg-rosa text-white rounded-full hover:bg-vino transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rosa"
            onClick={handleSave}
          >
            Save
          </button>
          {editingGoal && (
            <button
              type="button"
              className="w-full px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4"
              onClick={handleDelete}
            >
              Delete Goal
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

GoalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editingGoal: PropTypes.object,
};

export default GoalModal;

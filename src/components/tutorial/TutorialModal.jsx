import React from "react";
import InteractiveTutorial from "./InteractiveTutorial";

export default function TutorialModal({ open, onClose }) {
  if (!open) return null;
  return <InteractiveTutorial onComplete={onClose} />;
}

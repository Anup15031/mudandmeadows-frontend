import React from "react";

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Portal</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Update Gallery</li>
        <li>Take Offline Booking</li>
        <li>Update Booking</li>
        <li>Add Dining Menu Items to Booking</li>
        <li>Print Bill</li>
        <li>Add Site Details</li>
        <li>Add Wellness Program</li>
        <li>Add Experiences</li>
        <li>Book Wellness Programs</li>
      </ul>
      <p className="mt-6 text-muted-foreground">Select an option from the navigation above.</p>
    </div>
  );
}

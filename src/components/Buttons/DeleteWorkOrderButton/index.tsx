"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface DeleteWorkOrderButtonProps {
  workOrderId: string;
}

export default function DeleteWorkOrderButton({ workOrderId }: DeleteWorkOrderButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this work order?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/work-orders?workOrderId=${workOrderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete work order");
        return;
      }

      toast.success("Work order deleted");

      // Navigate back to dashboard
      router.push("/protectedPages/dashboard");

      // Ensure dashboard refreshes its data
      router.refresh();

    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
    >
      Delete Work Order
    </button>
  );
}

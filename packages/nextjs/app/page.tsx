"use client";
import { useState } from "react";
import RizzTokenDashboard from "~~/components/TokenMinter";
import PriceStabilizer from "~~/components/PriceStabilizer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("minter");

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="w-full max-w-6xl">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("minter")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "minter"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Token Minter
            </button>
            <button
              onClick={() => setActiveTab("stabilizer")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "stabilizer"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Price Stabilizer
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === "minter" && <RizzTokenDashboard />}
          {activeTab === "stabilizer" && <PriceStabilizer />}
        </div>
      </div>
    </div>
  );
}
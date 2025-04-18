import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

export const BarChart = ({ data }: { data: any }) => {
  return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

export const LineChart = ({ data }: { data: any }) => {
  return <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

export const PieChart = ({ data }: { data: any }) => {
  return <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
};

import React from 'react';

interface OrderStep {
  status: string;
  description: string;
  time: string;
  completed: boolean;
  current: boolean;
}

interface OrderTrackerProps {
  orderId: string;
  estimatedDeliveryTime: string;
  currentStatus: string;
  steps: OrderStep[];
}

export default function OrderTracker({
  orderId,
  estimatedDeliveryTime,
  currentStatus,
  steps,
}: OrderTrackerProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">Order #{orderId}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Estimated pick-up time: <span className="font-medium">{estimatedDeliveryTime}</span>
          </p>
        </div>
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            {currentStatus}
          </span>
        </div>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={index} className="mb-8 flex">
            <div className="flex flex-col items-center mr-4">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                step.completed ? 'bg-green-500 dark:bg-green-600' : 
                step.current ? 'bg-indigo-500 dark:bg-indigo-600' : 
                'bg-gray-200 dark:bg-gray-700'
              } ${step.completed || step.current ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-full w-0.5 ${
                  step.completed ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${
                step.current 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {step.status}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
              {step.time && (
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{step.time}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState } from 'react';

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface PortionOption {
  id: string;
  name: string;
  priceModifier: number;
}

interface CustomizationOption {
  id: string;
  name: string;
  options: string[];
}

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  basePrice: number;
  addOns: AddOn[];
  portionOptions: PortionOption[];
  customizationOptions: CustomizationOption[];
  onAddToCart: (customizedItem: any) => void;
}

export default function CustomizationModal({
  isOpen,
  onClose,
  itemName,
  basePrice,
  addOns,
  portionOptions,
  customizationOptions,
  onAddToCart,
}: CustomizationModalProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedPortion, setSelectedPortion] = useState<string>(portionOptions[0]?.id || '');
  const [customSelections, setCustomSelections] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [savePreferences, setSavePreferences] = useState(false);

  // Calculate the total price based on selections
  const calculateTotalPrice = () => {
    // Base price
    let total = basePrice;
    
    // Add selected portion price modifier
    const selectedPortionOption = portionOptions.find(option => option.id === selectedPortion);
    if (selectedPortionOption) {
      total += selectedPortionOption.priceModifier;
    }
    
    // Add selected add-ons
    selectedAddOns.forEach(addOnId => {
      const addOn = addOns.find(item => item.id === addOnId);
      if (addOn) {
        total += addOn.price;
      }
    });
    
    // Multiply by quantity
    return (total * quantity).toFixed(2);
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => {
      if (prev.includes(addOnId)) {
        return prev.filter(id => id !== addOnId);
      } else {
        return [...prev, addOnId];
      }
    });
  };

  const handleCustomizationChange = (optionId: string, value: string) => {
    setCustomSelections(prev => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const handleAddToCart = () => {
    const selectedAddOnObjects = addOns.filter(addOn => selectedAddOns.includes(addOn.id));
    const selectedPortionObject = portionOptions.find(option => option.id === selectedPortion);
    
    const customizedItem = {
      itemName,
      basePrice,
      selectedPortion: selectedPortionObject,
      selectedAddOns: selectedAddOnObjects,
      customizations: customSelections,
      quantity,
      specialInstructions,
      totalPrice: parseFloat(calculateTotalPrice()),
      savedForFuture: savePreferences,
    };
    
    onAddToCart(customizedItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold dark:text-white">{itemName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Portion Size Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Portion Size</h4>
          <div className="flex flex-wrap gap-2">
            {portionOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setSelectedPortion(option.id)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedPortion === option.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-700 border text-indigo-800 dark:text-indigo-200'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border text-gray-800 dark:text-gray-300'
                }`}
              >
                {option.name} {option.priceModifier > 0 ? `(+₹${option.priceModifier})` : option.priceModifier < 0 ? `(-₹${Math.abs(option.priceModifier)})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        {addOns.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add-ons</h4>
            <div className="space-y-2">
              {addOns.map(addOn => (
                <div key={addOn.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`addon-${addOn.id}`}
                    checked={selectedAddOns.includes(addOn.id)}
                    onChange={() => handleAddOnToggle(addOn.id)}
                    className="h-4 w-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor={`addon-${addOn.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {addOn.name}
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">+₹{addOn.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customization Options */}
        {customizationOptions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customization</h4>
            <div className="space-y-4">
              {customizationOptions.map(option => (
                <div key={option.id}>
                  <label htmlFor={`custom-${option.id}`} className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {option.name}
                  </label>
                  <select
                    id={`custom-${option.id}`}
                    value={customSelections[option.id] || ''}
                    onChange={(e) => handleCustomizationChange(option.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-700 dark:text-gray-200"
                  >
                    <option value="">Select</option>
                    {option.options.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="mb-6">
          <label htmlFor="special-instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Special Instructions
          </label>
          <textarea
            id="special-instructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special requests..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 h-20 text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity
          </label>
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-l-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
              </svg>
            </button>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-12 text-center p-2 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            />
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Save Preferences */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="save-preferences"
              type="checkbox"
              checked={savePreferences}
              onChange={(e) => setSavePreferences(e.target.checked)}
              className="h-4 w-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="save-preferences" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Save these preferences for future orders
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-bold dark:text-white">
            Total: ₹{calculateTotalPrice()}
          </div>
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
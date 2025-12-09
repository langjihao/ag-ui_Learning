'use client';

import { useFormStore } from '@/lib/store';

/**
 * 地址表单组件
 * Address Form Component
 */
export function AddressForm() {
  const { data, updateAddress } = useFormStore();
  const { address } = data;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Address</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="street" className="block text-sm font-medium mb-1">
            Street Address
          </label>
          <input
            id="street"
            type="text"
            value={address.street}
            onChange={(e) => updateAddress({ street: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City
            </label>
            <input
              id="city"
              type="text"
              value={address.city}
              onChange={(e) => updateAddress({ city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              placeholder="New York"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1">
              State / Province
            </label>
            <input
              id="state"
              type="text"
              value={address.state}
              onChange={(e) => updateAddress({ state: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              placeholder="NY"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
              ZIP / Postal Code
            </label>
            <input
              id="zipCode"
              type="text"
              value={address.zipCode}
              onChange={(e) => updateAddress({ zipCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              placeholder="10001"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={address.country}
              onChange={(e) => updateAddress({ country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
              placeholder="United States"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

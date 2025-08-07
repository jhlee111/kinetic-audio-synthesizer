
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from './Icons';

export interface DropdownOption<T extends string> {
    value: T;
    label: string;
    icon: React.FC<{className?: string}>;
}

interface DropdownProps<T extends string> {
    options: DropdownOption<T>[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel: string;
}

export const Dropdown = <T extends string>({ options, value, onChange, ariaLabel }: DropdownProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Guard against empty options to prevent crashes
    if (!options || options.length === 0) {
        return null;
    }
    
    const selectedOption = options.find(opt => opt.value === value) ?? options[0];

    const handleSelect = (optionValue: T) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const SelectedIcon = selectedOption.icon;

    return (
        <div className="relative w-32 sm:w-48" ref={dropdownRef}>
            <button
                type="button"
                className="w-full bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700/80 backdrop-blur-sm rounded-lg shadow-md px-2 sm:px-4 py-2 sm:py-2.5 text-left text-white flex items-center justify-between transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <SelectedIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">{selectedOption.label}</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <ul
                    className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden animate-fade-in-down"
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {options.map((option) => {
                        const Icon = option.icon;
                        const isSelected = option.value === value;
                        return (
                            <li
                                key={option.value}
                                className={`px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between cursor-pointer text-sm font-medium transition-colors ${
                                    isSelected
                                        ? 'bg-purple-600/50 text-white'
                                        : 'text-gray-300 hover:bg-gray-700/70'
                                }`}
                                onClick={() => handleSelect(option.value)}
                                role="option"
                                aria-selected={isSelected}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-xs sm:text-sm">{option.label}</span>
                                </div>
                                {isSelected && <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />}
                            </li>
                        );
                    })}
                </ul>
            )}
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

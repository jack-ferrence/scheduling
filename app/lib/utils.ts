// tiny helper utilities that are used across the app. For example, 
// the `cn` function is a common pattern in React projects for 
// conditionally joining class names together, especially when 
// using Tailwind CSS. 

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import * as React from "react"

const Toast = ({ children, ...props }) => {
  return (
    <div
      className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
      {...props}
    >
      {children}
    </div>
  )
}

const Toaster = () => {
  return null // We'll implement this later with a proper toast system
}

export { Toast, Toaster }

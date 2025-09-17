import React from 'react';

const Logo = ({ className = '', ...props }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="ClothCare Logo" 
        className="h-10 w-auto" 
        {...props}
      />
    </div>
  );
};

export default Logo;

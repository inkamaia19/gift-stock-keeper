// --- START OF FILE src/contexts/ActionContext.tsx ---
import React, { createContext, useContext, useState } from 'react';

type ActionContextType = {
  isCatalogOpen: boolean;
  setIsCatalogOpen: (open: boolean) => void;
  isBundleSaleOpen: boolean;
  setIsBundleSaleOpen: (open: boolean) => void;
};

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const ActionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isBundleSaleOpen, setIsBundleSaleOpen] = useState(false);

  return (
    <ActionContext.Provider value={{
      isCatalogOpen, setIsCatalogOpen,
      isBundleSaleOpen, setIsBundleSaleOpen,
    }}>
      {children}
    </ActionContext.Provider>
  );
};

export const useActions = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActions must be used within an ActionProvider');
  }
  return context;
};
// --- END OF FILE src/contexts/ActionContext.tsx ---
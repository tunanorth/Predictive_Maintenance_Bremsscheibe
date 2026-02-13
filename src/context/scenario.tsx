import { createContext, useContext, useState, ReactNode } from 'react';
import type { Scenario } from '@/types';
import { setScenario as setMockScenario, getCurrentScenario } from '@/mock/data';

interface ScenarioContextType {
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined
);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenarioState] = useState<Scenario>('NORMAL');

  const setScenario = (newScenario: Scenario) => {
    setScenarioState(newScenario);
    setMockScenario(newScenario);
  };

  return (
    <ScenarioContext.Provider value={{ scenario, setScenario }}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
}


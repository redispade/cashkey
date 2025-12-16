
import React from 'react';
import { CashflowItem } from '../types/cashflow';
import { cn } from '@/lib/utils';
import IncomeSection from './cashflow/IncomeSection';
import ExpenseSection from './cashflow/ExpenseSection';
import CashflowSummary from './cashflow/CashflowSummary';

interface CashflowFormProps {
  incomes: CashflowItem[];
  expenses: CashflowItem[];
  vatTotal: number;
  showVatRow: boolean;
  onUpdateIncomes: (incomes: CashflowItem[]) => void;
  onUpdateExpenses: (expenses: CashflowItem[]) => void;
  className?: string;
}

const CashflowForm: React.FC<CashflowFormProps> = ({
  incomes,
  expenses,
  vatTotal,
  showVatRow,
  onUpdateIncomes,
  onUpdateExpenses,
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      {/* Income Section */}
      <IncomeSection 
        incomes={incomes} 
        onUpdateIncomes={onUpdateIncomes} 
      />
      
      {/* Expense Section */}
      <ExpenseSection 
        expenses={expenses} 
        vatTotal={vatTotal}
        showVatRow={showVatRow}
        onUpdateExpenses={onUpdateExpenses} 
      />
      
      {/* Total Summary */}
      <CashflowSummary 
        incomes={incomes} 
        expenses={expenses} 
        vatTotal={vatTotal}
      />
    </div>
  );
};

export default CashflowForm;

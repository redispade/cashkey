import React from 'react';
import { CashflowItem } from '../../types/cashflow';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/cashflowUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CashflowSummaryProps {
  incomes: CashflowItem[];
  expenses: CashflowItem[];
  vatTotal: number;
}

const CashflowSummary: React.FC<CashflowSummaryProps> = ({
  incomes,
  expenses,
  vatTotal,
}) => {
  const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);
  const expenseBaseTotal = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalExpense = expenseBaseTotal + vatTotal;
  const balance = totalIncome - totalExpense;
  const isMobile = useIsMobile();
  const hasVat = vatTotal > 0;

  return (
    <Card className="md:col-span-2 shadow-soft animate-fade-in [animation-delay:200ms]">
      <CardContent className="pt-6">
        <div className={cn(
          "grid gap-4 text-center",
          hasVat ? "grid-cols-2 md:grid-cols-4" : "grid-cols-3"
        )}>
          <div>
            <p className={cn(
              "font-medium text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>Income</p>
            <p className={cn(
              "font-semibold text-income",
              isMobile ? "text-lg" : "text-2xl"
            )}>{formatCurrency(totalIncome)}</p>
          </div>
          {hasVat && (
            <div>
              <p className={cn(
                "font-medium text-muted-foreground",
                isMobile ? "text-xs" : "text-sm"
              )}>VAT</p>
              <p className={cn(
                "font-semibold text-muted-foreground",
                isMobile ? "text-lg" : "text-2xl"
              )}>{formatCurrency(vatTotal)}</p>
            </div>
          )}
          <div>
            <p className={cn(
              "font-medium text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>Expenses</p>
            <p className={cn(
              "font-semibold text-expense",
              isMobile ? "text-lg" : "text-2xl"
            )}>{formatCurrency(totalExpense)}</p>
              {hasVat && (
                <p className={cn(
                  "text-[11px] text-muted-foreground",
                  isMobile && "text-[10px]"
                )}>Includes {formatCurrency(vatTotal)} VAT</p>
              )}
          </div>
          <div>
            <p className={cn(
              "font-medium text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {balance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
            <p className={cn(
              "font-semibold",
              balance >= 0 ? "text-surplus" : "text-deficit",
              isMobile ? "text-lg" : "text-2xl"
            )}>
              {formatCurrency(Math.abs(balance))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashflowSummary;

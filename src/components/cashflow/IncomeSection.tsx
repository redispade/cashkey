import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CashflowItem } from '@/types/cashflow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Coins, Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/cashflowUtils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface IncomeSectionProps {
  incomes: CashflowItem[];
  onUpdateIncomes: (incomes: CashflowItem[]) => void;
}

const VAT_RATE = 0.2;

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return uuidv4();
};

const IncomeSection: React.FC<IncomeSectionProps> = ({ incomes, onUpdateIncomes }) => {
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomePeriod, setNewIncomePeriod] = useState('annual');
  const [newIncomeVatIncluded, setNewIncomeVatIncluded] = useState(false);
  const [editingIncome, setEditingIncome] = useState<CashflowItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editVatIncluded, setEditVatIncluded] = useState(false);
  const isMobile = useIsMobile();

  const handleAddIncome = () => {
    if (!newIncomeName || !newIncomeAmount) return;
    
    let parsedAmount = parseInt(newIncomeAmount.replace(/[^0-9]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    
    // Convert monthly amount to annual if needed
    if (newIncomePeriod === 'monthly') {
      parsedAmount = parsedAmount * 12;
    }
    const grossAmount = parsedAmount;
    let netAmount = parsedAmount;
    let vatAmount = 0;

    if (newIncomeVatIncluded) {
      netAmount = Math.round(parsedAmount / (1 + VAT_RATE));
      vatAmount = grossAmount - netAmount;
    }
    
    const newIncome: CashflowItem = {
      id: generateId(),
      name: newIncomeName,
      amount: netAmount,
      vatIncluded: newIncomeVatIncluded || undefined,
      vatAmount: newIncomeVatIncluded ? vatAmount : undefined,
      grossAmount: newIncomeVatIncluded ? grossAmount : undefined,
    };
    
    onUpdateIncomes([...incomes, newIncome]);
    setNewIncomeName('');
    setNewIncomeAmount('');
    setNewIncomeVatIncluded(false);
  };

  const handleDeleteIncome = (id: string) => {
    onUpdateIncomes(incomes.filter(income => income.id !== id));
  };

  const handleStartEdit = (income: CashflowItem) => {
    setEditingIncome(income);
    setEditName(income.name);
    const grossAmount = income.vatIncluded
      ? income.grossAmount ?? income.amount + (income.vatAmount ?? 0)
      : income.amount;
    setEditAmount(grossAmount.toString());
    setEditVatIncluded(Boolean(income.vatIncluded));
  };

  const handleSaveEdit = () => {
    if (!editingIncome || !editName || !editAmount) return;

    const parsedAmount = parseInt(editAmount.replace(/[^0-9]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    let netAmount = parsedAmount;
    let vatAmount = 0;
    let grossAmount: number | undefined = undefined;

    if (editVatIncluded) {
      netAmount = Math.round(parsedAmount / (1 + VAT_RATE));
      vatAmount = parsedAmount - netAmount;
      grossAmount = parsedAmount;
    }

    onUpdateIncomes(incomes.map(income => 
      income.id === editingIncome.id 
        ? { 
            ...income, 
            name: editName, 
            amount: netAmount,
            vatIncluded: editVatIncluded || undefined,
            vatAmount: editVatIncluded ? vatAmount : undefined,
            grossAmount,
          }
        : income
    ));
    setEditingIncome(null);
    setEditVatIncluded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
    setEditVatIncluded(false);
  };

  return (
    <Card className="shadow-soft animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-medium text-income flex items-center">
          Annual Income
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Tap an item to edit it.</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Existing incomes */}
          <div className="space-y-2">
          {incomes.map((income) => (
            <div 
              key={income.id} 
                className={cn(
                  "flex items-center justify-between p-3 bg-secondary/50 rounded-lg animate-slide-up cursor-pointer hover:bg-secondary/70 transition-colors",
                  editingIncome?.id === income.id && "bg-secondary"
                )}
                onClick={() => !editingIncome && handleStartEdit(income)}
              >
                {editingIncome?.id === income.id ? (
                  <>
                    <div className="flex-1 mr-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={cn(
                          "mb-2",
                          isMobile && "text-sm"
                        )}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                        <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
                          <Coins className="absolute left-2 md:left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            type="number"
                            min="0"
                            step="100"
                                className={cn(
                                  "pl-6 w-full no-spin",
                                  isMobile && "text-sm"
                                )}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            id={`income-${income.id}-vat`}
                            checked={editVatIncluded}
                            onCheckedChange={(checked) => setEditVatIncluded(checked === true)}
                          />
                          <Label
                            htmlFor={`income-${income.id}-vat`}
                            className={cn("text-[11px] leading-tight text-muted-foreground", isMobile && "text-[9px]")}
                          >
                            <span className="block">VAT</span>
                            <span className="block">incl.</span>
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit();
                        }}
                        className="h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
              <div className="flex-1 mr-4">
                <p className="font-medium">{income.name}</p>
                <p className="text-muted-foreground">
                  {formatCurrency(income.amount)}/year
                  {income.vatIncluded ? ` (VAT ${formatCurrency(income.vatAmount ?? 0)})` : ''}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIncome(income.id);
                      }}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
                  </>
                )}
            </div>
          ))}
          </div>
          
          {/* New income input */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={newIncomeName}
                onChange={(e) => setNewIncomeName(e.target.value)}
                placeholder="Income name"
                className={cn(
                  "flex-1 min-w-[140px]",
                  isMobile && "text-sm"
                )}
              />
              <div className="flex items-center gap-2">
                <div className="relative flex-shrink-0 w-[70px] md:w-[90px]">
                  <Coins className="absolute left-2 md:left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={newIncomeAmount}
                    onChange={(e) => setNewIncomeAmount(e.target.value)}
                    type="number"
                    min="0"
                    step="100"
                    className={cn(
                      "pl-6 w-full no-spin",
                      isMobile && "text-sm"
                    )}
                  />
                </div>
                  <div className="flex items-center gap-1">
                  <Checkbox
                    id="income-vat-included"
                    checked={newIncomeVatIncluded}
                    onCheckedChange={(checked) => setNewIncomeVatIncluded(checked === true)}
                  />
                  <Label
                    htmlFor="income-vat-included"
                      className={cn("text-[11px] leading-tight text-muted-foreground", isMobile && "text-[9px]")}
                  >
                      <span className="block">VAT</span>
                      <span className="block">incl.</span>
                  </Label>
                </div>
              </div>
              <Select
                value={newIncomePeriod}
                onValueChange={setNewIncomePeriod}
              >
                <SelectTrigger className={cn(
                  "w-[90px]",
                  isMobile && "text-sm"
                )}>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAddIncome} 
              className="w-full bg-income hover:bg-income/90"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Income
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeSection;

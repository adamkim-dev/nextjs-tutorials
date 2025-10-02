/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type FixedExpenseDraft = { name: string; amount: number };
type DebtDraft = { creditor: string; amountRemaining: number; monthlyPayment: number };
type LoanDraft = { borrower: string; amountRemaining: number; monthlyCollect: number };

interface SavingPlannerSetupState {
  selectedUserId: string | null;
  salary: number | null;
  payday: number | null; // 1-31
  fixedExpenses: FixedExpenseDraft[];
  debts: DebtDraft[];
  loans: LoanDraft[];
  step: number; // 1..3
}

const initialState: SavingPlannerSetupState = {
  selectedUserId: null,
  salary: null,
  payday: null,
  fixedExpenses: [],
  debts: [],
  loans: [],
  step: 1,
};

const savingPlannerSetupSlice = createSlice({
  name: "savingPlannerSetup",
  initialState,
  reducers: {
    setSelectedUserId(state, action: PayloadAction<string | null>) {
      state.selectedUserId = action.payload;
    },
    setSalary(state, action: PayloadAction<number | null>) {
      state.salary = action.payload;
    },
    setPayday(state, action: PayloadAction<number | null>) {
      state.payday = action.payload;
    },
    addFixedExpense(state, action: PayloadAction<FixedExpenseDraft>) {
      state.fixedExpenses.push(action.payload);
    },
    removeFixedExpense(state, action: PayloadAction<number>) {
      state.fixedExpenses.splice(action.payload, 1);
    },
    addDebt(state, action: PayloadAction<DebtDraft>) {
      state.debts.push(action.payload);
    },
    removeDebt(state, action: PayloadAction<number>) {
      state.debts.splice(action.payload, 1);
    },
    addLoan(state, action: PayloadAction<LoanDraft>) {
      state.loans.push(action.payload);
    },
    removeLoan(state, action: PayloadAction<number>) {
      state.loans.splice(action.payload, 1);
    },
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    resetWizard(state) {
      state.selectedUserId = null;
      state.salary = null;
      state.payday = null;
      state.fixedExpenses = [];
      state.debts = [];
      state.loans = [];
      state.step = 1;
    },
  },
});

export const {
  setSelectedUserId,
  setSalary,
  setPayday,
  addFixedExpense,
  removeFixedExpense,
  addDebt,
  removeDebt,
  addLoan,
  removeLoan,
  setStep,
  resetWizard,
} = savingPlannerSetupSlice.actions;

export default savingPlannerSetupSlice.reducer;
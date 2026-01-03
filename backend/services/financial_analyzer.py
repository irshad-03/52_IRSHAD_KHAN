import pandas as pd
import numpy as np
from typing import Dict, Any, List
from datetime import datetime

class FinancialAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self._prepare_data()
    
    def _prepare_data(self):
        """Prepare and clean the financial data"""
        # Try to identify date column
        date_cols = [col for col in self.df.columns if 'date' in col.lower() or 'period' in col.lower() or 'quarter' in col.lower()]
        if date_cols:
            self.df[date_cols[0]] = pd.to_datetime(self.df[date_cols[0]], errors='coerce')
            self.df = self.df.sort_values(date_cols[0])
        
        # Try to identify revenue column
        revenue_cols = [col for col in self.df.columns if 'revenue' in col.lower() or 'sales' in col.lower() or 'income' in col.lower()]
        if revenue_cols:
            self.revenue_col = revenue_cols[0]
        else:
            # Use first numeric column as revenue
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            self.revenue_col = numeric_cols[0] if len(numeric_cols) > 0 else None
    
    def calculate_yoy_change(self) -> float:
        """Calculate Year-over-Year change"""
        if self.revenue_col is None:
            return 0.0
        
        revenues = self.df[self.revenue_col].dropna()
        if len(revenues) < 2:
            return 0.0
        
        # Assuming quarterly data, compare last 4 periods with previous 4
        if len(revenues) >= 4:
            recent = revenues.iloc[-4:].sum()
            previous = revenues.iloc[-8:-4].sum() if len(revenues) >= 8 else revenues.iloc[-4:].sum()
        else:
            recent = revenues.iloc[-1]
            previous = revenues.iloc[0]
        
        if previous == 0:
            return 0.0
        
        return ((recent - previous) / previous) * 100
    
    def calculate_qoq_change(self) -> float:
        """Calculate Quarter-over-Quarter change"""
        if self.revenue_col is None:
            return 0.0
        
        revenues = self.df[self.revenue_col].dropna()
        if len(revenues) < 2:
            return 0.0
        
        recent = revenues.iloc[-1]
        previous = revenues.iloc[-2]
        
        if previous == 0:
            return 0.0
        
        return ((recent - previous) / previous) * 100
    
    def calculate_kpis(self) -> Dict[str, Any]:
        """Calculate Key Performance Indicators"""
        if self.revenue_col is None:
            return {}
        
        revenues = self.df[self.revenue_col].dropna()
        
        kpis = {
            "total_revenue": float(revenues.sum()),
            "average_revenue": float(revenues.mean()),
            "revenue_growth_rate": float(revenues.pct_change().mean() * 100) if len(revenues) > 1 else 0.0,
            "revenue_volatility": float(revenues.std()),
        }
        
        # Calculate other financial metrics if columns exist
        expense_cols = [col for col in self.df.columns if 'expense' in col.lower() or 'cost' in col.lower()]
        if expense_cols:
            expenses = self.df[expense_cols[0]].dropna()
            kpis["total_expenses"] = float(expenses.sum())
            kpis["net_income"] = float(revenues.sum() - expenses.sum())
            kpis["profit_margin"] = float((kpis["net_income"] / revenues.sum()) * 100) if revenues.sum() != 0 else 0.0
        
        return kpis
    
    def get_chart_data(self) -> Dict[str, Any]:
        """Prepare data for chart visualization"""
        if self.revenue_col is None:
            return {"type": "bar", "data": [], "series": []}
        
        # Get last 8 periods for visualization
        chart_df = self.df.tail(8).copy()
        
        # Prepare data points
        data = []
        for idx, row in chart_df.iterrows():
            period = str(idx) if 'date' not in str(row.index[0]).lower() else str(row.iloc[0])
            data_point = {"period": period}
            
            # Add revenue
            if self.revenue_col:
                data_point[self.revenue_col] = float(row[self.revenue_col]) if pd.notna(row[self.revenue_col]) else 0
            
            # Add other numeric columns
            numeric_cols = chart_df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if col != self.revenue_col and col not in data_point:
                    data_point[col] = float(row[col]) if pd.notna(row[col]) else 0
            
            data.append(data_point)
        
        series = list(numeric_cols[:4])  # Limit to 4 series for clarity
        
        return {
            "type": "line",
            "data": data,
            "series": series,
        }
    
    def analyze(self) -> Dict[str, Any]:
        """Perform comprehensive financial analysis"""
        yoy_change = self.calculate_yoy_change()
        qoq_change = self.calculate_qoq_change()
        kpis = self.calculate_kpis()
        chart_data = self.get_chart_data()
        
        return {
            "yoy_change": yoy_change,
            "qoq_change": qoq_change,
            "total_revenue": kpis.get("total_revenue", 0),
            "average_revenue": kpis.get("average_revenue", 0),
            "revenue_growth_rate": kpis.get("revenue_growth_rate", 0),
            "kpis": kpis,
            "chart_data": chart_data,
        }


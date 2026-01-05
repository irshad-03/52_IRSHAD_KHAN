import os
from typing import Dict, Any, List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
import pandas as pd

class ReportGenerator:
    def __init__(self, analyzer):
        self.analyzer = analyzer
        self.vectorstore = None
        self.embeddings = None
        self.llm = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize LangChain models and vector store"""
        # Use environment variables for API keys
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if not openai_api_key:
            print("Warning: OPENAI_API_KEY not found. Using default models.")
            # You can use alternative models here
            return
        
        try:
            # Initialize embeddings
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-3-small",
                openai_api_key=openai_api_key
            )
            
            # Initialize LLM
            self.llm = ChatOpenAI(
                model_name="gpt-4-turbo-preview",
                temperature=0.7,
                openai_api_key=openai_api_key
            )
        except Exception as e:
            print(f"Error initializing models: {e}")
            self.embeddings = None
            self.llm = None
    
    def _chunk_financial_data(self) -> List[Document]:
        """Convert financial data into document chunks for RAG"""
        chunks = []
        
        # Convert dataframe to text representation
        df_text = self.analyzer.df.to_string()
        
        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
        text_chunks = text_splitter.split_text(df_text)
        
        # Create Document objects
        for i, chunk in enumerate(text_chunks):
            chunks.append(Document(
                page_content=chunk,
                metadata={"source": f"financial_data_chunk_{i}", "type": "financial_data"}
            ))
        
        # Add analysis results as additional context
        analysis_text = f"""
        Financial Analysis Results:
        - Year-over-Year Change: {self.analyzer.calculate_yoy_change():.2f}%
        - Quarter-over-Quarter Change: {self.analyzer.calculate_qoq_change():.2f}%
        - Total Revenue: ${self.analyzer.calculate_kpis().get('total_revenue', 0):,.2f}
        """
        
        chunks.append(Document(
            page_content=analysis_text,
            metadata={"source": "analysis_summary", "type": "analysis"}
        ))
        
        return chunks
    
    def _create_vectorstore(self, chunks: List[Document]):
        """Create vector store from document chunks"""
        if not self.embeddings:
            return
        
        try:
            self.vectorstore = Chroma.from_documents(
                documents=chunks,
                embedding=self.embeddings,
                persist_directory="./chroma_db"
            )
        except Exception as e:
            print(f"Error creating vectorstore: {e}")
            self.vectorstore = None
    
    def _generate_mda_sections(self, relevant_chunks: List[str]) -> Dict[str, str]:
        if not self.llm:
            return self._generate_template_report()

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", 
            "You are a financial analyst writing a Management Discussion & Analysis (MD&A) report. "
            "Use the provided financial data and analysis to create structured sections."),
            ("human", 
            """Financial Data Context:
    {context}

    Analysis Results:
    - YoY Change: {yoy_change}%
    - QoQ Change: {qoq_change}%
    - Total Revenue: ${total_revenue}

    Generate:
    1. Executive Summary
    2. Revenue Trends
    3. KPIs
    4. Risks
    5. Outlook
    """)
        ])

        try:
            chain = prompt_template | self.llm

            context = "\n\n".join(relevant_chunks[:5])

            result = chain.invoke({
                "context": context,
                "yoy_change": f"{self.analyzer.calculate_yoy_change():.2f}",
                "qoq_change": f"{self.analyzer.calculate_qoq_change():.2f}",
                "total_revenue": f"{self.analyzer.calculate_kpis().get('total_revenue', 0):,.2f}"
            })

            report_text = result.content if hasattr(result, "content") else str(result)

            return {
                "report": report_text,
                "citations": relevant_chunks
            }

        except Exception as e:
            print(f"LLM generation error: {e}")
        return self._generate_template_report()

    
    def _generate_template_report(self) -> Dict[str, str]:
        """Generate report using template (fallback when LLM is not available)"""
        yoy = self.analyzer.calculate_yoy_change()
        qoq = self.analyzer.calculate_qoq_change()
        kpis = self.analyzer.calculate_kpis()
        
        report = f"""# Management Discussion & Analysis (MD&A) Report

## Executive Summary

This report provides a comprehensive analysis of the company's financial performance based on the submitted financial statements.

**Key Highlights:**
- Year-over-Year (YoY) Revenue Change: **{yoy:.2f}%**
- Quarter-over-Quarter (QoQ) Revenue Change: **{qoq:.2f}%**
- Total Revenue: **${kpis.get('total_revenue', 0):,.2f}**

## Revenue Trends and Drivers

### Year-over-Year Analysis
The company has shown a {'positive' if yoy > 0 else 'negative'} YoY revenue change of {yoy:.2f}%. This indicates {'strong growth' if yoy > 10 else 'moderate growth' if yoy > 0 else 'declining revenue'} compared to the previous year.

### Quarter-over-Quarter Analysis
The most recent quarter shows a {'growth' if qoq > 0 else 'decline'} of {qoq:.2f}% compared to the previous quarter. This {'suggests positive momentum' if qoq > 0 else 'indicates potential challenges'} in the short term.

### Revenue Drivers
- Average quarterly revenue: ${kpis.get('average_revenue', 0):,.2f}
- Revenue growth rate: {kpis.get('revenue_growth_rate', 0):.2f}%
- Revenue volatility: ${kpis.get('revenue_volatility', 0):,.2f}

## Key Performance Indicators

The analysis reveals several important KPIs:

1. **Total Revenue**: ${kpis.get('total_revenue', 0):,.2f}
2. **Average Revenue**: ${kpis.get('average_revenue', 0):,.2f}
"""
        
        if 'total_expenses' in kpis:
            report += f"""
3. **Total Expenses**: ${kpis.get('total_expenses', 0):,.2f}
4. **Net Income**: ${kpis.get('net_income', 0):,.2f}
5. **Profit Margin**: {kpis.get('profit_margin', 0):.2f}%
"""
        
        report += f"""
## Risks and Challenges

Based on the financial trends observed:

1. **Revenue Volatility**: {'The revenue shows moderate stability' if kpis.get('revenue_volatility', 0) < kpis.get('average_revenue', 1) * 0.2 else 'High revenue volatility indicates potential market instability'}
2. **Growth Sustainability**: {'The positive growth trend appears sustainable' if yoy > 0 and qoq > 0 else 'Mixed signals between YoY and QoQ changes require careful monitoring'}
3. **Market Conditions**: {'Favorable market conditions' if yoy > 5 else 'Challenging market conditions'} are reflected in the revenue performance

## Outlook

### Near-term Expectations
{'Positive momentum is expected to continue' if qoq > 0 else 'Careful monitoring of revenue trends is recommended'} based on the QoQ change of {qoq:.2f}%.

### Strategic Considerations
- Continue {'capitalizing on growth trends' if yoy > 0 else 'addressing revenue decline through strategic initiatives'}
- Monitor key performance indicators closely
- Adjust strategies based on quarterly performance patterns

---

*Report generated automatically from financial data analysis. [Source: financial_data_chunks]*
"""
        
        return {
            "report": report,
            "citations": ["financial_data_chunks", "analysis_summary"]
        }
    
    async def generate_mda_report(self) -> Dict[str, Any]:
        """Generate complete MD&A report with RAG"""
        # Chunk financial data
        chunks = self._chunk_financial_data()
        
        # Create vector store if embeddings are available
        if self.embeddings:
            self._create_vectorstore(chunks)
            
            # Retrieve relevant chunks based on query
            if self.vectorstore:
                query = "financial performance revenue trends analysis"
                relevant_docs = self.vectorstore.similarity_search(query, k=5)
                relevant_chunks = [doc.page_content for doc in relevant_docs]
            else:
                relevant_chunks = [chunk.page_content for chunk in chunks[:5]]
        else:
            relevant_chunks = [chunk.page_content for chunk in chunks[:5]]
        
        # Generate MD&A sections
        result = self._generate_mda_sections(relevant_chunks)
        
        # Get chart data
        chart_data = self.analyzer.get_chart_data()
        
        return {
            "report": result["report"],
            "citations": result.get("citations", []),
            "chart_data": chart_data,
        }

